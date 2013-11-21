module("Exhibit.Controls");

test("filter", function() {
    expect(6);
    var filter_expression, res;
    var db = Exhibit.Database.create();
    db.loadItems([
        {
            label: 'good',
            anchor: 'anchor',
            bool_prop: true,
            string_prop: "yes"
        },
        {
            label: 'bad',
            anchor: 'anchor',
            bool_prop: false,
            string_prop: "no way"
        }
                  ], 'about:');
    filter_expression = Exhibit.ExpressionParser.parse("filter( !anchor , .string_prop = 'yes' )");
    res = filter_expression.evaluateOnItem('anchor', db);
    equal(res.size, 1);
    ok(res.values.contains('good'))

    filter_expression = Exhibit.ExpressionParser.parse("filter( !anchor , .bool_prop)");
    res = filter_expression.evaluateOnItem('anchor', db);
    equal(res.size, 1);
    ok(res.values.contains('good'))

    filter_expression = Exhibit.ExpressionParser.parse("filter( !anchor , not( .bool_prop ) )");
    res = filter_expression.evaluateOnItem('anchor', db);
    equal(res.size, 1);
    ok(res.values.contains('bad'))
});
