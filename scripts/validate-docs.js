const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const options = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2017,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
};
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
}
const blocks = [];
for (const file of walk(path.join(root, 'docs')).filter((file) =>
  file.endsWith('.md'),
)) {
  const content = fs.readFileSync(file, 'utf8');
  const pattern = /^([ \t]*)```(typescript|tsx|ts)\s*\r?\n([\s\S]*?)^\1```/gm;
  for (const match of content.matchAll(pattern)) {
    const code = match[3].replace(new RegExp(`^${match[1]}`, 'gm'), '');
    blocks.push({
      file,
      line: content.slice(0, match.index).split('\n').length + 1,
      code,
    });
  }
}
const readabilityReport = blocks
  .filter((block) => /\bimport\(['"]afnm-types['"]\)\s*\./.test(block.code))
  .map((block) => ({
    file: block.file,
    line: block.line,
    message: 'Use readable named types or explicit fields in documentation instead of package type lookups.',
  }));
const virtual = new Map();
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
host.readFile = (file) => virtual.get(path.resolve(file)) ?? readFile(file);
host.fileExists = (file) => virtual.has(path.resolve(file)) || fileExists(file);
host.getSourceFile = (file, languageVersion) => {
  const text = host.readFile(file);
  return text === undefined
    ? undefined
    : ts.createSourceFile(file, text, languageVersion, true);
};
const api = path.join(root, 'node_modules/afnm-types/dist/index.d.ts');
let program = ts.createProgram([api], options, host);
let checker = program.getTypeChecker();
const apiExports = checker.getExportsOfModule(
  checker.getSymbolAtLocation(program.getSourceFile(api)),
);
const ambient = apiExports
  .flatMap((symbol) => {
    const target =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const name = symbol.name;
    const declarations = [];
    if (target.flags & ts.SymbolFlags.Type)
      declarations.push(`type ${name} = import('afnm-types').${name};`);
    if (target.flags & ts.SymbolFlags.Value)
      declarations.push(
        `declare const ${name}: typeof import('afnm-types').${name};`,
      );
    return declarations;
  })
  .join('\n');
const globals = path.join(root, '.docs-check/globals.d.ts');
// Documentation may name supporting game types that the package does not export
// independently. Resolve those names in the checker, while keeping the guides readable.
const referenceHelpers = new Map([
  ['BuffCombatImage', "NonNullable<import('afnm-types').Buff['combatImage']>"],
  ['EntityImage', "NonNullable<import('afnm-types').PlayerSprite['image']>"],
  ['ImagePack', "NonNullable<NonNullable<import('afnm-types').PlayerSprite['image']>['variants']>[number]"],
  ['ImageOffset', "NonNullable<NonNullable<import('afnm-types').PlayerSprite['image']>['idleOffset']>"],
  ['RandomPhaseEnemyBuilder', "NonNullable<import('afnm-types').CombatStep['enemyBuilders']>[number]"],
  ['SvgIconComponent', "import('@mui/icons-material').SvgIconComponent"],
]);
virtual.set(
  globals,
  ambient +
    '\n' + [...referenceHelpers].map(([name, type]) => `type ${name} = ${type};`).join('\n') +
    '\ndeclare const Box: typeof import("@mui/material").Box;\ndeclare const Typography: typeof import("@mui/material").Typography;\ninterface Window { modAPI: import("afnm-types").ModAPI }',
);
for (const [i, block] of blocks.entries()) {
  block.virtual = path.join(root, `.docs-check/block-${i}.tsx`);
  let code = block.code;
  // Bare object examples need an expression context, rather than a statement block.
  if (/^\s*(?:\/\/[^\n]*\n\s*)*\{/.test(code))
    code = `const example = (${code.trim().replace(/;$/, '')});`;
  block.virtual = path.resolve(block.virtual).replaceAll('\\', '/');
  virtual.set(block.virtual, `export {};\n${code}`);
}
host.readFile = (file) =>
  virtual.get(path.resolve(file).replaceAll('\\', '/')) ?? readFile(file);
host.fileExists = (file) =>
  virtual.has(path.resolve(file).replaceAll('\\', '/')) || fileExists(file);
virtual.set(globals.replaceAll('\\', '/'), virtual.get(globals));
program = ts.createProgram(
  [globals, ...blocks.map((block) => block.virtual)],
  options,
  host,
);
checker = program.getTypeChecker();
// Complete snippets can be checked directly. Signature listings and field-only
// fragments are validated through their extracted objects and API paths below.
const snippetReport = [];
for (const block of blocks) {
  const source = program.getSourceFile(block.virtual);
  if (program.getSyntacticDiagnostics(source).length) continue;
  for (const d of program
    .getSemanticDiagnostics(source)
    .filter((d) =>
      [2322, 2339, 2345, 2353, 2741, 2448, 2454, 2554, 2556].includes(d.code),
    )) {
    const pos = source.getLineAndCharacterOfPosition(d.start ?? 0);
    snippetReport.push({
      file: block.file,
      line: block.line + pos.line - 1,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    });
  }
}
console.log('Scanned ' + blocks.length + ' TypeScript documentation blocks.');

// Validate object literals separately from surrounding illustrative code. References
// supplied by a mod (assets, other items, etc.) are holes; authored literal fields
// and every nested object are checked against the published package types.
const canonical = new Map(
  apiExports.map((symbol) => {
    const target =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    return [symbol.name, checker.getDeclaredTypeOfSymbol(target)];
  }),
);
for (const node of program.getSourceFile(globals).statements) {
  if (ts.isTypeAliasDeclaration(node) && referenceHelpers.has(node.name.text))
    canonical.set(node.name.text, checker.getTypeAtLocation(node));
}
const typedNames = new Map();
for (const block of blocks) {
  const source = program.getSourceFile(block.virtual);
  function collect(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.type
    ) {
      typedNames.set(node.name.text, node.type.getText(source));
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
}
function chooseType(node, block) {
  const kind = node.properties?.find((p) => p.name?.getText() === 'kind');
  if (!kind || !ts.isStringLiteral(kind.initializer)) return undefined;
  if (kind.initializer.text === 'randomPhases')
    return "NonNullable<CombatStep['enemyBuilders']>[number]";
  const family = block.file.endsWith(`${path.sep}crafting${path.sep}buffs.md`)
    ? 'CraftingBuffEffect'
    : block.file.endsWith(`${path.sep}crafting${path.sep}techniques.md`)
      ? 'CraftingTechniqueEffect'
      : block.file.includes(`${path.sep}quests${path.sep}`)
        ? 'QuestStep'
        : block.file.includes(`${path.sep}events${path.sep}`)
          ? 'EventStep'
          : block.file.includes(`${path.sep}items${path.sep}`)
            ? 'Item'
            : block.file.endsWith('effects.md') ||
                block.file.endsWith('interceptions.md')
              ? 'BuffEffect'
              : block.file.endsWith('building-types.md')
                ? 'LocationBuilding'
                : undefined;
  const matches = [];
  for (const [name, type] of canonical) {
    const prop = type.getProperty('kind');
    if (!prop) continue;
    const kindType = checker.getTypeOfSymbolAtLocation(
      prop,
      prop.valueDeclaration ?? prop.declarations[0],
    );
    if (!kindType.isStringLiteral() || kindType.value !== kind.initializer.text)
      continue;
    const names = node.properties.map((p) => p.name?.getText()).filter(Boolean);
    const score = names.filter((n) => type.getProperty(n)).length;
    matches.push({ name, score, type });
  }
  if (family && canonical.get(family)) {
    const members = canonical.get(family).isUnion()
      ? canonical.get(family).types
      : [canonical.get(family)];
    const member = members.find((t) => {
      const p = t.getProperty('kind');
      if (!p) return false;
      const kt = checker.getTypeOfSymbolAtLocation(
        p,
        p.valueDeclaration ?? p.declarations[0],
      );
      return kt.isStringLiteral() && kt.value === kind.initializer.text;
    });
    if (member)
      return `Extract<${family}, { kind: '${kind.initializer.text}' }>`;
    if (
      family === 'QuestStep' &&
      canonical.get('QuestReward').types?.some((t) => {
        const p = t.getProperty('kind');
        if (!p) return false;
        const kt = checker.getTypeOfSymbolAtLocation(
          p,
          p.valueDeclaration ?? p.declarations[0],
        );
        return kt.isStringLiteral() && kt.value === kind.initializer.text;
      })
    )
      return `Extract<QuestReward, { kind: '${kind.initializer.text}' }>`;
  }
  matches.sort((a, b) => b.score - a.score);
  if (matches.length) return matches[0].name;
  // Technique effects and buff effects share some kinds but have different unions.
  if (family === 'BuffEffect') {
    const technique = canonical.get('TechniqueEffect');
    if (
      technique?.types?.some((t) => {
        const p = t.getProperty('kind');
        const k =
          p &&
          checker.getTypeOfSymbolAtLocation(
            p,
            p.valueDeclaration ?? p.declarations[0],
          );
        return k?.isStringLiteral() && k.value === kind.initializer.text;
      })
    )
      return `Extract<TechniqueEffect, { kind: '${kind.initializer.text}' }>`;
  }
  return family;
}
const objectChecks = [];
for (const block of blocks) {
  const source = program.getSourceFile(block.virtual);
  function collect(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      (ts.isObjectLiteralExpression(node.initializer) ||
        ts.isArrayLiteralExpression(node.initializer))
    ) {
      let type = node.type?.getText(source);
      if (
        type &&
        ![...canonical.keys()].some((name) =>
          new RegExp(`\\b${name}\\b`).test(type),
        )
      )
        type = undefined;
      if (!type && ts.isObjectLiteralExpression(node.initializer))
        type = chooseType(node.initializer, block);
      if (type) objectChecks.push({ block, node: node.initializer, type });
      return;
    }
    if (
      ts.isObjectLiteralExpression(node) &&
      ts.isParenthesizedExpression(node.parent)
    ) {
      const type = chooseType(node, block);
      if (type) objectChecks.push({ block, node, type });
      return;
    }
    if (
      ts.isObjectLiteralExpression(node) &&
      ts.isCallExpression(node.parent) &&
      /^window\.modAPI\.actions\./.test(node.parent.expression.getText())
    ) {
      const method = node.parent.expression.getText().split('.').at(-1);
      const index = node.parent.arguments.indexOf(node);
      objectChecks.push({
        block,
        node,
        type: `Parameters<import('afnm-types').ModAPI['actions']['${method}']>[${index}]`,
      });
      return;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const type = chooseType(node, block);
      if (type) {
        objectChecks.push({ block, node, type });
        return;
      }
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
}
for (const [i, check] of objectChecks.entries()) {
  check.virtual = `${root.replaceAll('\\', '/')}/.docs-check/object-${i}.tsx`;
  check.prefix = `export {};\nconst example: ${check.type} = `;
  let text = check.node.getText();
  virtual.set(check.virtual, check.prefix + text + ';');
}
let objectProgram = ts.createProgram(
  [globals, ...objectChecks.map((check) => check.virtual)],
  options,
  host,
);
const objectChecker = objectProgram.getTypeChecker();
for (const check of objectChecks) {
  const source = objectProgram.getSourceFile(check.virtual);
  const diagnostics = objectProgram
    .getSemanticDiagnostics(source)
    .filter((d) => [2304, 2552, 18004].includes(d.code));
  const replacements = [];
  for (const d of diagnostics) {
    let token;
    function locate(node) {
      if (node.getStart(source) <= d.start && node.end >= d.start + d.length) {
        token = node;
        ts.forEachChild(node, locate);
      }
    }
    locate(source);
    if (!token) continue;
    const name = token.getText(source);
    let expression = token;
    while (
      (ts.isPropertyAccessExpression(expression.parent) ||
        ts.isCallExpression(expression.parent)) &&
      expression.parent.expression === expression
    )
      expression = expression.parent;
    if (
      typedNames.has(name) &&
      expression === token &&
      !/^Partial</.test(typedNames.get(name))
    ) {
      replacements.push({
        start: token.getStart(source),
        end: token.end,
        text: `(undefined! as ${typedNames.get(name)})`,
      });
    } else if (ts.isSpreadAssignment(expression.parent)) {
      const context = objectChecker.getContextualType(expression.parent.parent);
      const type = context
        ? objectChecker.typeToString(
            context,
            undefined,
            ts.TypeFormatFlags.NoTruncation,
          )
        : check.type;
      replacements.push({
        start: expression.getStart(source),
        end: expression.end,
        text: `(undefined! as NonNullable<${type}>)`,
      });
    } else if (ts.isShorthandPropertyAssignment(expression.parent)) {
      replacements.push({
        start: expression.getStart(source),
        end: expression.end,
        text: `${name}: undefined!`,
      });
    } else {
      replacements.push({
        start: expression.getStart(source),
        end: expression.end,
        text: 'undefined!',
      });
    }
  }
  let code = virtual.get(check.virtual);
  const nonoverlapping = [];
  for (const edit of replacements.sort(
    (a, b) => b.end - b.start - (a.end - a.start),
  )) {
    if (!nonoverlapping.some((e) => edit.start < e.end && edit.end > e.start))
      nonoverlapping.push(edit);
  }
  for (const edit of nonoverlapping.sort((a, b) => b.start - a.start))
    code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  // A property expression models an external value without triggering TypeScript's
  // syntactic always-nullish check on expressions such as `external ?? 0`.
  virtual.set(
    check.virtual,
    code.replaceAll('undefined!', '({} as { value: never }).value'),
  );
}
objectProgram = ts.createProgram(
  [globals, ...objectChecks.map((check) => check.virtual)],
  options,
  host,
);
const objectReport = ts
  .getPreEmitDiagnostics(objectProgram)
  .filter((d) => d.file && d.file.fileName.includes('/object-'))
  .map((d) => {
    const check = objectChecks.find(
      (check) => check.virtual === d.file.fileName,
    );
    const pos = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
    const origin = check.node
      .getSourceFile()
      .getLineAndCharacterOfPosition(check.node.getStart());
    return {
      file: path.relative(root, check.block.file).replaceAll('\\', '/'),
      line: check.block.line + origin.line - 1 + pos.line - 1,
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      type: check.type,
      object: check.node.getText(),
      virtual: check.virtual,
    };
  });
console.log(
  `${objectChecks.length} object examples; ${objectReport.length} diagnostics`,
);

const directoryExists = host.directoryExists.bind(host);
host.directoryExists = (dir) =>
  [...virtual.keys()].some((file) =>
    file.startsWith(path.resolve(dir).replaceAll('\\', '/') + '/'),
  ) || directoryExists(dir);
const tutorialFiles = new Map();
for (const block of blocks.filter((b) =>
  b.file.includes(`${path.sep}first-mod${path.sep}`),
)) {
  const text = fs.readFileSync(block.file, 'utf8');
  const preceding = text
    .split('\n')
    .slice(0, block.line - 1)
    .join('\n');
  const mentions = [
    ...preceding.matchAll(/\*\*File(?: to create)?:\*\* `([^`]+\.ts)`/g),
  ];
  const destination = mentions.at(-1)?.[1];
  if (
    !destination ||
    (destination.endsWith('/index.ts') &&
      !block.file.endsWith('07-testing-polish.md'))
  )
    continue;
  tutorialFiles.set(
    destination,
    (tutorialFiles.get(destination) ?? '') + '\n' + block.code,
  );
}
const tutorialPaths = [];
for (const [file, code] of tutorialFiles) {
  const dest = root.replaceAll('\\', '/') + '/.docs-check/first-mod/' + file;
  virtual.set(dest, code);
  tutorialPaths.push(dest);
}
const tutorialProgram = ts.createProgram(
  [path.join(root, 'src/global.d.ts'), ...tutorialPaths],
  options,
  host,
);
const tutorialReport = ts.getPreEmitDiagnostics(tutorialProgram).map((d) => ({
  file: d.file?.fileName,
  line: d.file?.getLineAndCharacterOfPosition(d.start ?? 0).line + 1,
  code: d.code,
  message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
}));
console.log(
  `Assembled first-mod tutorial: ${tutorialFiles.size} files, ${tutorialReport.length} diagnostics`,
);

const schemaChecks = [];
const schemaTypes = new Map(
  [...canonical].map(([name, type]) => [
    name,
    { type, expression: referenceHelpers.get(name) ?? `import('afnm-types').${name}` },
  ]),
);
for (const [name, type] of canonical)
  if (type.isUnion())
    for (const member of type.types) {
      const p = member.getProperty('kind');
      if (!p || !member.symbol) continue;
      const k = checker.getTypeOfSymbolAtLocation(
        p,
        p.valueDeclaration ?? p.declarations?.[0],
      );
      if (
        k.isStringLiteral() &&
        member.symbol.name !== '__type' &&
        !schemaTypes.has(member.symbol.name)
      )
        schemaTypes.set(member.symbol.name, {
          type: member,
          expression: `Extract<import('afnm-types').${name}, {kind: '${k.value}'}>`,
        });
    }
const schemaIssues = [];
for (const block of blocks) {
  const source = program.getSourceFile(block.virtual);
  for (const node of source.statements.filter(ts.isInterfaceDeclaration)) {
    let target = schemaTypes.get(node.name.text);
    // Several private interfaces share names across combat and crafting unions.
    // Resolve an excerpt in its documented system rather than whichever export
    // happened to be visited first.
    const families = block.file.endsWith(`${path.sep}crafting${path.sep}buffs.md`)
      ? ['CraftingBuffEffect']
      : block.file.endsWith(`${path.sep}crafting${path.sep}techniques.md`)
        ? ['CraftingTechniqueEffect'] : [];
    for (const family of families) {
      const member = canonical.get(family)?.types?.find(t => t.symbol?.name === node.name.text);
      if (!member) continue;
      const prop = member.getProperty('kind');
      const kind = checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration ?? prop.declarations[0]);
      if (kind.isStringLiteral()) target = {
        type: member, expression: `Extract<import('afnm-types').${family}, { kind: '${kind.value}' }>`,
      };
    }
    if (!target) continue;
    for (const prop of node.members.filter(ts.isPropertySignature)) {
      const name = prop.name.getText(source).replace(/^['"]|['"]$/g, '');
      const actual = target.type.getProperty(name);
      if (!actual) {
        schemaIssues.push({
          file: block.file,
          line: block.line,
          message: `${node.name.text}.${name} is not in afnm-types`,
        });
        continue;
      }
      const optional = Boolean(actual.flags & ts.SymbolFlags.Optional);
      if (optional !== Boolean(prop.questionToken))
        schemaIssues.push({
          file: block.file,
          line: block.line,
          message: `${node.name.text}.${name} must be ${optional ? 'optional' : 'required'}`,
        });
      if (!prop.type) continue;
      schemaChecks.push({
        block,
        node,
        prop,
        name,
        target,
        virtual: `${root.replaceAll('\\', '/')}/.docs-check/schema-${schemaChecks.length}.ts`,
      });
    }
  }
}
for (const check of schemaChecks) {
  let documented = check.prop.type.getText();
  const refs = [];
  function mapRefs(node) {
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      schemaTypes.has(node.typeName.text)
    )
      refs.push(node);
    else ts.forEachChild(node, mapRefs);
  }
  mapRefs(check.prop.type);
  for (const node of refs.sort((a, b) => b.getStart() - a.getStart())) {
    const start = node.getStart() - check.prop.type.getStart();
    const end = node.end - check.prop.type.getStart();
    documented =
      documented.slice(0, start) +
      schemaTypes.get(node.typeName.text).expression +
      documented.slice(end);
  }
  virtual.set(
    check.virtual,
    `export {};\ndeclare const documented: ${documented};\nconst actual: ${check.target.expression}['${check.name}'] = documented;`,
  );
}
const schemaProgram = ts.createProgram(
  [globals, ...schemaChecks.map((c) => c.virtual)],
  options,
  host,
);
const schemaDiagnostics = ts
  .getPreEmitDiagnostics(schemaProgram)
  .filter((d) => d.file?.fileName.includes('/schema-'));
const schemaReport = schemaDiagnostics.map((d) => {
  const check = schemaChecks.find((c) => c.virtual === d.file.fileName);
  return {
    file: check.block.file,
    line: check.block.line,
    message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    schema: check.node.name.text,
    prop: check.name,
    code: d.code,
  };
});
console.log(
  `Reference schemas: ${schemaChecks.length} properties, ${schemaIssues.length + schemaReport.length} diagnostics`,
);

const apiChecks = [];
for (const block of blocks)
  for (const match of block.code.matchAll(
    /\bwindow\.modAPI(?:\.[A-Za-z_$][\w$]*)+/g,
  )) {
    const virtualPath = `${root.replaceAll('\\', '/')}/.docs-check/api-${apiChecks.length}.ts`;
    virtual.set(virtualPath, `export {};\n${match[0]};`);
    apiChecks.push({ block, expression: match[0], virtual: virtualPath });
  }
const apiProgram = ts.createProgram(
  [globals, ...apiChecks.map((c) => c.virtual)],
  options,
  host,
);
const apiReport = ts
  .getPreEmitDiagnostics(apiProgram)
  .filter((d) => d.file?.fileName.includes('/api-'))
  .map((d) => {
    const check = apiChecks.find((c) => c.virtual === d.file.fileName);
    return {
      file: check.block.file,
      line: check.block.line,
      expression: check.expression,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    };
  });
console.log(
  `API references: ${apiChecks.length} paths, ${apiReport.length} diagnostics`,
);

const failures = [
  ...readabilityReport,
  ...snippetReport,
  ...objectReport,
  ...tutorialReport,
  ...schemaIssues,
  ...schemaReport,
  ...apiReport,
];
for (const failure of failures) {
  const file = failure.file
    ? path
        .relative(root, path.resolve(root, failure.file))
        .replaceAll('\\', '/')
    : 'compiler';
  console.error(file + ':' + (failure.line ?? 1) + ': ' + failure.message);
}

if (process.argv.includes('--self-test')) {
  const assert = require('node:assert/strict');
  // Run the reported bug through the same object extraction/compiler pipeline.
  const character = objectChecks.find(
    (c) => c.type === 'Character' && c.node.getText().includes("'Master Chen'"),
  );
  assert.ok(
    character,
    'Master Chen must be covered by documentation validation',
  );
  const original = virtual.get(character.virtual);
  const missingGender = original.replace(/^\s*gender: [^\n]+\n/m, '\n');
  assert.notEqual(
    missingGender,
    original,
    'The tutorial must explicitly supply gender',
  );
  virtual.set(character.virtual, missingGender);
  const regression = ts.createProgram(
    [globals, character.virtual],
    options,
    host,
  );
  assert.ok(
    ts
      .getPreEmitDiagnostics(regression)
      .some((d) =>
        ts
          .flattenDiagnosticMessageText(d.messageText, ' ')
          .includes("Property 'gender' is missing"),
      ),
    'Removing Character.gender must fail validation',
  );
  virtual.set(character.virtual, original);

  const fixture = root.replaceAll('\\', '/') + '/.docs-check/regression.ts';
  virtual.set(
    fixture,
    "export {}; const invalid: BuffEffect = { kind: 'damage', amount: { value: 'invalid', stat: undefined } }; window.modAPI.actions.addBuildings([]);",
  );
  const invalidProgram = ts.createProgram([globals, fixture], options, host);
  const errors = ts.getPreEmitDiagnostics(invalidProgram);
  assert.ok(
    errors.some((d) => d.code === 2322),
    'Invalid nested effect scaling must be rejected',
  );
  assert.ok(
    errors.some((d) => d.code === 2339),
    'Removed ModAPI actions must be rejected',
  );
  console.log(
    'Regression checks passed: missing gender, nested scaling, removed API.',
  );
}

process.exitCode = failures.length ? 1 : 0;
