import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Removed .next cache");
} catch (error) {
  console.error(
    "Could not remove .next. Stop `npm run dev` first, then run `npm run clean` again.",
  );
  console.error(error);
  process.exit(1);
}
