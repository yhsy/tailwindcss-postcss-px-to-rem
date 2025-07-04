// @jest-environment node

// __tests__/index.test.ts

// import { expect, it } from "jest";
// import * as postcss from "postcss";
import postcss from "postcss";
// const postcss = require("postcss");
import pxToRem from "../index";

async function run(input: string, output: string, options = {}) {
  const result = await postcss([pxToRem(options)]).process(input, {
    from: undefined,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it("converts px in square bracket notation", async () => {
  await run(".w-[50px] { color: red; }", ".w-[3.125rem] { color: red; }", {
    rootValue: 16,
  });
});

it("handles complex square bracket expressions", async () => {
  await run(
    "[&>*]:[margin-top:16px][padding:8px] { display: block; }",
    "[&>*]:[margin-top:1rem][padding:0.5rem] { display: block; }",
    { rootValue: 16 }
  );
});

it("excludes 1px in square bracket notation", async () => {
  await run(
    ".border-[1px] { border-width: 1px; }",
    ".border-[1px] { border-width: 1px; }",
    { excludeOnePx: true }
  );
});
