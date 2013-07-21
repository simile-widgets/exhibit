#!/usr/bin/perl
$count = @ARGV[0];
print '{ "items": [',"\n";
for ($i=0; $i<$count; $i++) {
    print '{"label": "item', $i, '", "even": ',
    ($i % 2) ? '"no"' : '"yes"',
    '},', "\n";
}
print '{"label": "last", "even": "maybe"}';
print "\n]}\n";

