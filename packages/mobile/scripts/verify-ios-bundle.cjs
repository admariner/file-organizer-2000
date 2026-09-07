/**
 * Production iOS bundle checks without Xcode (RN 0.83 needs Xcode 16.1+ for pod install).
 * Run from repo root: node packages/mobile/scripts/verify-ios-bundle.cjs
 */
const fs = require("fs");
const path = require("path");
const Metro = require("metro");

const mobileRoot = path.resolve(__dirname, "..");
const outDir = path.join(mobileRoot, ".cache/ios-bundle-verify");
const bundlePath = path.join(outDir, "main.jsbundle.js");
const mapPath = path.join(outDir, "main.jsbundle.map");

async function dumpBundle() {
  process.chdir(mobileRoot);
  fs.mkdirSync(outDir, { recursive: true });

  const config = await Metro.loadConfig({
    cwd: mobileRoot,
    config: path.join(mobileRoot, "metro.config.js"),
  });
  config.projectRoot = mobileRoot;

  console.log("→ Building production iOS bundle (Hermes-style minify off for readable lines)…");
  await Metro.runBuild(config, {
    platform: "ios",
    entry: path.join(mobileRoot, "index.ts"),
    out: bundlePath.replace(/\.js$/, ""),
    minify: false,
    dev: false,
    sourceMap: true,
  });
}

function readBundle() {
  const p = fs.existsSync(bundlePath) ? bundlePath : bundlePath.replace(/\.js$/, "");
  if (!fs.existsSync(p)) {
    throw new Error(`Bundle missing at ${p}. Run dump first.`);
  }
  return fs.readFileSync(p, "utf8");
}

function readSources() {
  if (!fs.existsSync(mapPath)) return [];
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  return map.sources || [];
}

/**
 * The shim path only appears in the eval-annotate catch at the *end* of the
 * Metro factory. A short lookahead from that string misses css-interop at the
 * top of the same module (false pass before build 40).
 */
function extractMetroFactory(bundle, marker) {
  const idx = bundle.indexOf(marker);
  if (idx < 0) return "";
  const start = bundle.lastIndexOf("__d(function", idx);
  if (start < 0) return "";
  const rest = bundle.slice(start);
  const endMatch = rest.match(/\n\},(\d+),\[[^\]]*\]\);/);
  if (!endMatch || endMatch.index == null) {
    return rest.slice(0, 20000);
  }
  return rest.slice(0, endMatch.index + endMatch[0].length);
}

/** @returns {{ pass: boolean, detail: string }[]} */
function runChecks(bundle, sources) {
  const sourceText = sources.join("\n");
  const checks = [];
  const stackFactory = extractMetroFactory(
    bundle,
    "[shims/create-native-stack-navigator.js]",
  );

  function check(name, pass, detail) {
    checks.push({ name, pass, detail });
  }

  check(
    "Stack shim Metro factory present",
    stackFactory.length > 0,
    stackFactory
      ? `Factory ${stackFactory.length} chars`
      : "Missing [shims/create-native-stack-navigator.js] annotation",
  );

  const requiresGlassPackage =
    /require\(_dependencyMap\[\d+\],\s*["']expo-glass-effect["']\)/.test(
      stackFactory,
    ) || /require\(["']expo-glass-effect["']\)/.test(stackFactory);
  const callsLiquidGlass = /\.isLiquidGlassAvailable\s*\(/.test(stackFactory);

  check(
    "Stack fork patched (GLASS = false, no glass require)",
    /GLASS\s*=\s*false/.test(stackFactory) && !requiresGlassPackage,
    /GLASS\s*=\s*false/.test(stackFactory)
      ? requiresGlassPackage
        ? "GLASS = false but expo-glass-effect still required"
        : "Patched stack shim in bundle"
      : "Missing GLASS = false — stack fork still imports glass",
  );

  check(
    "Stack shim without NativeWind css-interop",
    stackFactory.length > 0 &&
      !stackFactory.includes("react-native-css-interop"),
    stackFactory.includes("react-native-css-interop")
      ? "NativeWind still rewrote the shim (jsx-runtime / stylesheet)"
      : "Shim factory has no css-interop require",
  );

  check(
    "No isLiquidGlassAvailable() during stack fork init",
    stackFactory.length > 0 && !callsLiquidGlass,
    callsLiquidGlass
      ? "Shim still calls isLiquidGlassAvailable() at load"
      : "Stack shim does not call isLiquidGlassAvailable()",
  );

  check(
    "Toast shim (no bottom-tabs barrel in Toast path)",
    sourceText.includes("shims/expo-router-toast") ||
      !sourceText.includes("expo-router/build/views/Toast.js"),
    sourceText.includes("shims/expo-router-toast")
      ? "Toast resolves to shim"
      : sourceText.includes("expo-router/build/views/Toast.js")
        ? "Real Toast.js still in source map"
        : "Toast source not found",
  );

  check(
    "css-interop StyleSheet shim",
    sourceText.includes("shims/css-interop-native-stylesheet") ||
      sourceText.includes("css-interop-native-stylesheet.js"),
    sourceText.includes("css-interop-native-stylesheet")
      ? "Native StyleSheet shim in graph"
      : "css-interop native stylesheet shim missing from source map",
  );

  check(
    "Clerk native bundle (not DOM clerk.js)",
    sourceText.includes("clerk-js/dist/clerk.native.js"),
    sourceText.includes("clerk-js/dist/clerk.js") &&
      !sourceText.includes("clerk.native.js")
      ? "DOM clerk.js in source map — bad"
      : sourceText.includes("clerk.native.js")
        ? "clerk.native.js present"
        : "No clerk-js in map (unexpected)",
  );

  check(
    "URL polyfill shim",
    sourceText.includes("shims/react-native-url-polyfill-auto"),
    sourceText.includes("react-native-url-polyfill/auto.js") &&
      !sourceText.includes("shims/react-native-url-polyfill-auto")
      ? "Real url-polyfill/auto still linked"
      : "Shim or absent",
  );

  check(
    "Boot entry (index.ts)",
    sourceText.includes("packages/mobile/index.ts") ||
      sourceText.includes("/mobile/index.ts"),
    "Entry should be packages/mobile/index.ts",
  );

  check(
    "Glass stub package (optional fallback for other imports)",
    !sourceText.includes("node_modules/expo-glass-effect/build/") ||
      sourceText.includes("shims/expo-glass-effect-pkg"),
    sourceText.includes("shims/expo-glass-effect-pkg")
      ? "expo-glass-effect resolves to shim when imported elsewhere"
      : "Real expo-glass-effect not in graph (ok if stack fork is patched)",
  );

  return checks;
}

(async () => {
  const refresh = process.argv.includes("--refresh") || !fs.existsSync(bundlePath);
  if (refresh) {
    await dumpBundle();
  } else {
    console.log(`→ Reusing ${bundlePath} (pass --refresh to rebuild)`);
  }

  const bundle = readBundle();
  const sources = readSources();
  const checks = runChecks(bundle, sources);

  console.log("");
  let failed = 0;
  for (const { name, pass, detail } of checks) {
    const mark = pass ? "✔" : "✘";
    console.log(`${mark} ${name}`);
    console.log(`  ${detail}`);
    if (!pass) failed += 1;
  }

  console.log("");
  console.log(`Bundle: ${bundlePath} (${(bundle.length / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Sources in map: ${sources.length}`);

  if (failed > 0) {
    console.error(`\n${failed} check(s) failed — fix Metro shims before another EAS build.`);
    process.exit(1);
  }

  console.log("\nAll bundle checks passed. Safe to run one remote EAS iOS build for TestFlight.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
