#!/usr/bin/perl
use feature qw(say);

my $info = `lsof -i -P | grep node`;

my %hash  = ();

my $max_len  = 0;

for my $line(split(/\n/g, $info)) {
	if ($line =~ m/\-\>/) { # drop active connections, usually WS
		next;
	}
	my @line_cols = split(/\s+/g, $line);
	my $port_info = $line_cols[8];
	my $path_info = `ls -d -l /proc/$line_cols[1]/cwd`;
	my @path_cols  = split(/->\s+/, $path_info);
	my $path = $path_cols[1];
	chomp ($path);
	
	my $path_len = length $path;
	
	if ($path_len > $max_len) {
		$max_len = $path_len;
	}
	
	$port_info =~ tr/0-9//cd;
	$hash{$port_info} = [$path];
}

my $nginx_dir  = "/etc/nginx/sites-enabled";
opendir my $dir, $nginx_dir or die "Cannot open NGINX directory: $!";

for my $host (readdir $dir) {
	if ($host ne "." and $host ne "..") {
		my $config;
		open(my $fh, '<', $nginx_dir."/".$host) or die "cannot open host config file $filename";
		{
			local $/;
			$config = <$fh>;
		}
		$config =~ m/^\s*proxy_pass\s+http\:\/\/127\.0\.0\.1\:(.*?)\;$/gm;
		if ($1 and exists $hash{$1}) {
			push (@{$hash{$1}}, $host);
		}
		close($fh);		
	}
}

closedir $dir;

$max_len += 10;
foreach my $port (sort keys %hash) {
	my @site_info = @{$hash{$port}};
	my $proxy = (scalar @site_info > 1) ? $site_info[1]: '';
    printf " %-${max_len}s %s %s\n", $site_info[0], $port, $proxy;
}
