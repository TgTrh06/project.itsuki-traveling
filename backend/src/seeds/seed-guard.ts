export function assertSafeSeedEnvironment() {
  const overrideEnabled = process.env.ALLOW_DESTRUCTIVE_SEED === "true";
  if (process.env.NODE_ENV !== "development" && !overrideEnabled) {
    throw new Error(
      "Seed is blocked outside NODE_ENV=development. Set ALLOW_DESTRUCTIVE_SEED=true only for an intentional non-production reset.",
    );
  }
}
