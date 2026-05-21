// Recipe-verify scratch files. One file per task that ships new code blocks.
//
// Goal: `pnpm run verify-recipes` from /webpage must succeed with every
// recipes/*.ts file present, proving each recipe's TypeScript compiles in a
// real Angular project.
//
// Convention for stubbing user-supplied classes referenced by recipes:
//
// 1. Define the stub class inline at the top of the verify file.
// 2. Match the public shape used in the recipe (constructor signature,
//    methods called, types). Don't implement behavior — just enough to
//    satisfy the compiler.
//
// Example for a recipe that references `MyHttpLoader`:
//
//   class MyHttpLoader {
//       constructor(_http: HttpClient, _prefix: string) {}
//       getTranslation(_lang: string) {
//           return of({});
//       }
//   }
//
// Keep stubs minimal. The recipe-verify pass is a TYPE check, not a
// runtime check. Behavioral correctness comes from the unit test suite
// in /core, not from these files.
//
// One file per task: recipes/task-2-1-loader.ts, recipes/task-5-1-ssr.ts, etc.
// Each file is re-exported from recipes/index.ts so Angular's compiler picks
// it up during type checking.

export {};
