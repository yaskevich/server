#!/usr/bin/perl
# use feature qw(say);

my $info = `lsof -i -P | grep node`;

my %hash  = ();

for my $line(split(/\n/g, $info)) {
	my @line_cols = split(/\s+/g, $line);
	my $port_info = $line_cols[8];
	my $path_info = `ls -d -l /proc/$line_cols[1]/cwd`;
	my @path_cols  = split(/->\s+/, $path_info);
	my $path = $path_cols[1];
	chomp ($path);
	$port_info =~ tr/0-9//cd;
	$hash{$port_info} = $path;
}

foreach my $port (sort keys %hash) {
    printf " %-45s %s\n", $hash{$port}, $port;
}
