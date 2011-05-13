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

test("substitute", function() {
    expect(4);

    var text = "The %0 and the %1, the %3 jumped over the %2.";
    var ntext = "The cat and the fiddle";
    var xtext = "The %0 and \\%1";
    var subs1 = ["cat", "fiddle", "moon", "cow"];
    var subs2 = [];

    strictEqual(String.substitute(ntext, subs1), ntext, "No interpolations available");
    strictEqual(String.substitute(text, subs2), text, "No objects substitution");
    strictEqual(String.substitute(text, subs1), "The cat and the fiddle, the cow jumped over the moon.", "General substitution test");
    strictEqual(String.substitute(xtext, subs1), "The cat and %1", "Escape substitution");
});

test("trim", function() {
    expect(4);

    strictEqual((new String("A")).trim(), "A", "'A'.trim() === 'A'");
    strictEqual((new String(" A ")).trim(), "A", "' A '.trim() === 'A'");
    strictEqual((new String("   A")).trim(), "A", "'   A'.trim() === 'A'");
    strictEqual((new String("A   ")).trim(), "A", "'A   '.trim() === 'A'");
});
