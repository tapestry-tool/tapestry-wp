# CircleOfSupport

The `CircleOfSupport` acitivity is a TYDE activity that allows users to manage their closest connections and group them into communities.

Its data is split into three major pieces &mdash; connections, communities, and circles:

```ts
interface CircleOfSupport {
  id: string
  connections: Connection[]
  communities: Community[]
  circles: Circle[]
}
```

## Connections

A `Connection` represents a single individual. A connection follows the following interface:

```ts
interface Connection {
  id: string
  name: string
  avatar: Emoji
  communities: string[] // Community ids
}
```

## Communities

A `Community` represents a group of `Connection`s with some commonality. A `Community` follows the following interface:

```ts
interface Community {
  id: string
  name: string
  icon: Emoji
  color: HexString
  connections: string[] // Connection ids
}
```

## Circles

A `Circle` represents connections with equal "closeness" to the user. It is simply an object with a `connections` property:

```ts
interface Circle {
  connections: string[] // Connection ids
}
```

The "closeness" of the circle is determined by the `Circle`'s index in the `CircleOfSupport` `circles` array, where a lower index means the circle represents a closer group of connections.
