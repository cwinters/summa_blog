#!/usr/bin/perl

use strict;
use Redis;

my $ADDRESS = '127.0.0.1:6379';

my %ACTIONS = (
  one => sub {
      my $redis = connection();
      my $rv = $redis->set('p_one', 'Single value from Perl');
      my $get = $redis->get('p_one');
      print("Set returned: $rv; get: $get\n");
  }
);

my ($action, $new_address) = @ARGV;
$ADDRESS = $new_address if ($new_address);

my $call = $ACTIONS{$action};
if ($call) {
    $call->();
}
else {
    print("No such action [$action]\n");
}



sub connection {
    return Redis->new($ADDRESS);
}
