# create-typescript-npm-library

Simple typescript app with jest to create a npm library with types

## Installation

```sh
npx degit https://github.com/TheSmartMonkey/create-typescript-npm-library app
```

## Getting started

1. Install nodejs : https://nodejs.org/en/

2. Install node_modules with `npm install`

3. Available commands with `npm run` (`npm start` runs your code from `main.ts`)

## Running Tests

To run the tests for your library, use the following command:

```sh
npm run test
```

This will execute all test files using Jest.

## Publish your library

To publish your library to npm, use the following command:

```sh
npm run pub
```

Ensure you have updated the version in `package.json` and are logged into npm.

## Folder tree

```
|   .eslintrc.json
|   .gitignore
|   .prettierignore
|   .prettierrc.json
|   jest.config.ts
|   LICENSE
|   main.ts
|   package-lock.json
|   package.json
|   README.md
|   tsconfig.json
|
+---debug
    +---main.ts
    +---package-lock.json
    +---package.json
|
+---src
|   +---functions
        hello.test.ts
        hello.ts
    +---libs
        .gitkeep
    +---models
        hello.model.ts
```
