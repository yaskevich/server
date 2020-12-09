#!/usr/bin/perl
use warnings;
use strict;
use File::Find;
use File::Basename qw( basename );
my $size = 0;
my $only_size = 0;
my $thres = 5*1024*1024;
use Term::ANSIColor;
# use Image::Magick;
# use File::LibMagic qw();
my @data = ();


find( \&wanted, shift(@ARGV) );

sub wanted {
	$size += -f $_ ? -s _ : 0;
	# $dir = $File::Find::name if -d;
	info ((-s _), $_, $File::Find::name, $File::Find::dir) if -f $_;
}


sub info {
	my ($bytes, $short, $full, $f_dir) = @_;
	my $hr_size = size_in_mb($bytes);
	my $sh_dir = basename($f_dir);
	# my($filename, $directories, $suffix) = fileparse($full);
	# print $hr_size.' MB <- ['.$sh_dir.'] '.$short."\n"  if $bytes > $thres;
	if ($bytes > $thres) {
		push @data, { bytes =>$bytes, mb => $hr_size, full => $full, short => $short, dir => $sh_dir };
		$only_size+=$bytes;
	}
}

sub size_in_mb {
    my $size_in_bytes = shift;
    return sprintf("%7.1f", $size_in_bytes / (1024 * 1024));
}

sub print_info {
	my (%f) = @_;
	# print $hr_size.' MB <- ['.$sh_dir.'] '.$short."\n"  if $bytes > $thres;
	print "\e[1;31m".$f{mb}."\e[m".' MB <- ['.$f{dir}.'] '. colored($f{short}, ($f{full} !~ m/(.+?\.(djvu|pdf)$)/i ? "red" :"green"))."\n";
	print "\t".$f{full}."\n";
}
my @sorted =  sort { $b->{mb} <=> $a->{mb} } @data;

# print "------------------\n";

foreach my $item (@sorted){
	print_info (%{$item});
}
print 'These:'.size_in_mb($only_size), " MB\n";
print 'Total:'.size_in_mb($size), " MB\n";
