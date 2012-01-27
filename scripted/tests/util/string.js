module("String");

test("endsWith", function() {
    expect(4);

    ok((new String("A")).endsWith("A"), "'A'.endsWith('A')");
    ok((new String("AA")).endsWith("A"), "'AA'.endsWith('A')");
    ok(!(new String("AA")).endsWith("B"), "!'AA'.endsWith('B')");
    ok(!(new String("AA")).endsWith("AAA"), "!'AA'.endsWith('AAA')");
});

test("startsWith", function() {
    expect(4);

    ok((new String("A")).startsWith("A"), "'A'.startsWith('A')");
    ok((new String("AA")).startsWith("A"), "'AA'.startsWith('A')");
    ok(!(new String("AA")).startsWith("B"), "!'AA'.startsWith('B')");
    ok(!(new String("AA")).startsWith("AAA"), "!'AA'.startsWith('AAA')");
});

test("trim", function() {
    expect(4);

    strictEqual((new String("A")).trim(), "A", "'A'.trim() === 'A'");
    strictEqual((new String(" A ")).trim(), "A", "' A '.trim() === 'A'");
    strictEqual((new String("   A")).trim(), "A", "'   A'.trim() === 'A'");
    strictEqual((new String("A   ")).trim(), "A", "'A   '.trim() === 'A'");
});
