## Client setup

There are clients to exercise Redis in four languages here:

* Java: using [jedis](https://github.com/xetorthio/jedis)
* JavaScript: using [node_redis](https://github.com/mranney/node_redis)
* Perl: using [perl-redis](https://github.com/melo/perl-redis)
* Ruby: using [redis-rb](https://github.com/redis/redis-rb)

Your favorite language probably has a client too --
[check out the list](http://redis.io/clients).

All instructions below worked on my Ubuntu 12.10 installation.

### Java

Download one of the
[JARs](http://github.com/xetorthio/jedis/downloads);
you can also build from source, assuming you have a
[JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
and [gradle](http://www.gradle.org/) installed:

    $ git clone git@github.com:xetorthio/jedis.git
    $ cd jedis
    $ gradle jar
    $ cp build/libs/*.jar ..

### JavaScript

Assuming you have [node](http://nodejs.org) installed, :

    $ npm install -g node-redis

### Perl

Assuming you have Perl and the `cpan` command-line tool:

    $ sudo cpan install Redis

### Ruby

Assuming you have Ruby and the `gem` command-line tool:

    $ gem install redis
