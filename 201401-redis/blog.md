# Learning a bit about Redis

[Redis](http://redis.io) frequently gets lumped in with all the other
NoSQL databases. And it certainly shares features with a number of
them. But it also has its own functional sweet spots and while
striving for simplicity in both deployment and protocol.

In this post we'll go over some ways that Redis looks like a simple
key/value store suitable for caching. But we'll also go over how it
extends the cache from simple strings to more complex data structures
like arrays, hashes and sets, and look at its support for
publish/subscribe notifications.

In this little project we're going to use:

* Serialized JSON structures stored as a Redis string
* Redis hashes, sets and arrays
* Redis sorted sets to track most recent polls

We'll do this in multiple languages so you can see how common client
libraries interact with Redis.

## Setup

__1.__ Check out the repository

Code and configuration (not much!) backing this post is
[on github](http://github.com/cwinters/summa_blog/tree/master/201401-redis). It's
not required but it'll move you along and provide code that's not
excerpted here.

__2.__ Get Redis

Follow [instructions](http://redis.io/download) for installing Redis
on your preferred environment. You can also setup a Heroku application
and add the free [Redis To Go](https://addons.heroku.com/redistogo)
add-on and connect to your instance over the network. (This post will
assume you're running locally.)

__3.__ Start it up

Fire Redis up with the configuration from the git repository:

    $ redis-server redis.conf

you'll see something like this:

    cwinters@abita:~/Projects/github/summa_blog/201401-redis$ redis-server redis.conf
                    _._
               _.-``__ ''-._
          _.-``    `.  `_.  ''-._           Redis 2.8.4 (00000000/0) 64 bit
      .-`` .-```.  ```\/    _.,_ ''-._
     (    '      ,       .-`  | `,    )     Running in stand alone mode
     |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
     |    `-._   `._    /     _.-'    |     PID: 25143
      `-._    `-._  `-./  _.-'    _.-'
     |`-._`-._    `-.__.-'    _.-'_.-'|
     |    `-._`-._        _.-'_.-'    |           http://redis.io
      `-._    `-._`-.__.-'_.-'    _.-'
     |`-._`-._    `-.__.-'    _.-'_.-'|
     |    `-._`-._        _.-'_.-'    |
      `-._    `-._`-.__.-'_.-'    _.-'
          `-._    `-.__.-'    _.-'
              `-._        _.-'
                  `-.__.-'

    [25143] 14 Jan 09:54:07.269 # Server started, Redis version 2.8.4
    [25143] 14 Jan 09:54:07.269 # WARNING overcommit_memory is set to 0! ...
    [25143] 14 Jan 09:54:07.269 * The server is now ready to accept connections on port 6379

Now we're ready to go.

## Basic key/value store

Redis can function as a simple key/value store in the realm of
[memcached](http://memcached.org/); here are common operations:

* get/set operations to associate data with a unique key (GET/SET)
* removing a key (DELETE)
* setting an expiration time with a key's data, including
  assigning/updating it after the SET (EXPIRE + TOUCH) and removing
  the expiration entirely (PERSIST + TOUCH with a 0 expiration); Redis
  also allows you to peek at a key's expiration time (TTL)
* storing data only if is or is not already defined (SET with flags +
  ADD/REPLACE);
* incrementing and decrementing a key's value (INCR/DECR), including
  by a different amount than 1
* appending data to an existing key (APPEND); memcached also has
  PREPEND

Memcached has two additional simple commands, GETS and CAS, that allow
you to only assign data to a key only if it hasn't been updated since
a known checkpoint.

For its part, Redis allows bit operations on key values (BITOP,
BITCOUNT, GETBIT), substring operations (GETRANGE, SETRANGE), and both
getting (MGET) and setting multiple values at once (MSET).

We'll run one of our Ruby clients to exercise some of these Redis
operations.
