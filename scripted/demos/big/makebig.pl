#!/usr/bin/perl
$count = @ARGV[0];
print <<END;
{ "properties": {"mod3" : {"valueType" : "number"},
                 "mod137" : {"valueType" : "number"}
                },
  "items": [
END
for ($i=0; $i<$count; $i++) {
    print '{"label": "item', $i, '", "even": ',
    ($i % 2) ? '"no"' : '"yes"',
    ', "mod3": "',$i%3,'"',
    ', "mod4": "',$i%4,'"',
    ', "mod37": "',$i%37,'"',
    ', "mod137": "',$i%137,'"',
    '},', "\n";
}
print '{"label": "last", "even": "maybe"}';
print "\n]}\n";

