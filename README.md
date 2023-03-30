## Description

### Database

Models
The following models are included in the schema:

- User: Represents a user of the social network. Includes fields for email, name, username, friends, liked messages, and more.

- Request: Represents a notification that requires action, such as a friend request. Includes fields for the type of request, the recipient, and the creator.
- Alert: Represents a notification that does not require action, such as a friend deletion. Includes fields for the type of alert, the recipients, and the creator.
- Member: Represents a user's membership in a chat. Includes fields for the user, the chat, and the user's role in the chat.
- Chat: Represents a chat between one or more users. Includes fields for the chat type, name, description, and more.
- Event: Represents an event that occurs within a chat, such as a message or chat update. Includes fields for the event type, the chat, and the creator.
- Message: Represents a message sent within a chat. Includes fields for the content and the users who have liked the message.
- ChatUpdate: Represents an update to a chat's name or description. Includes fields for the type of update, the event, and the previous name or description.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
