Action to pay or request money using the [Venmo API](https://github.com/austenstone/venmo-typescript).

## Usage
Create a workflow (eg: `.github/workflows/venmo.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

Add secrets `USERNAME` and `PASSWORD`. the `USERNAME` can be a username, email, or phone number.

#### Example: Request money on the 1st of every month
```yml
name: Request Rent

on:
  schedule:
    - cron: '0 0 1 * *'
  workflow_dispatch:

jobs:
  add_to_project:
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/venmo-pay@main
        with:
          phone_email_or_username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          recipients: Austen-Stone,user1,user2,user3
          amount: -1.00
          note: Rent
          audience: Public
```

## Input Settings
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| **phone_email_or_username** | The phone, email, or username to login with | N/A |
| **password** | The password to login with | N/A |
| **recipients** | A list of comma separated usernames to send or request money from. | N/A |
| **amount** | The amount to send or request. Negative(-) amounts are requests, positive(+) are payments | N/A |
| **note** | The note to send with the transaction | N/A |
| **audience** | The audience to send the transaction to. Either "public" or "private" | N/A |

## References
- [Venmo](https://venmo.com/)
