module("String");

test("endsWith", function() {
    expect(4);

    ok("A".endsWith("A"), "'A'.endsWith('A')");
    ok("AA".endsWith("A"), "'AA'.endsWith('A')");
    ok(!"AA".endsWith("B"), "!'AA'.endsWith('B')");
    ok(!"AA".endsWith("AAA"), "!'AA'.endsWith('AAA')");
});

test("startsWith", function() {
    expect(4);

    ok("A".startsWith("A"), "'A'.startsWith('A')");
    ok("AA".startsWith("A"), "'AA'.startsWith('A')");
    ok(!"AA".startsWith("B"), "!'AA'.startsWith('B')");
    ok(!"AA".startsWith("AAA"), "!'AA'.startsWith('AAA')");
});

test("substitute", function() {
//    expect();

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

    strictEqual("A".trim(), "A", "'A'.trim() === 'A'");
    strictEqual(" A ".trim(), "A", "' A '.trim() === 'A'");
    strictEqual("   A".trim(), "A", "'   A'.trim() === 'A'");
    strictEqual("A   ".trim(), "A", "'A   '.trim() === 'A'");
});
