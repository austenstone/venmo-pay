/* eslint-disable @typescript-eslint/no-unused-vars */
import * as core from '@actions/core';
import fetch from 'node-fetch';
import { Access, Input } from './types';
import readline from 'readline';

export function getInputs(): Input {
  const result = {} as Input;
  result.phone_email_or_username = core.getInput('phone_email_or_username') || process.env.email || '';
  result.password = core.getInput('password') || process.env.password || '';
  result.usernames = core.getInput('usernames') || process.env.usernames || '';
  return result;
}

const run = async (): Promise<void> => {
  const base = 'https://api.venmo.com/v1';
  const deviceId = '88884260-05O3-8U81-58I1-2WA76F357GR9';
  const input = getInputs();

  const login = (phoneEmailUsername, password, headers?) => {
    console.log('login', phoneEmailUsername, password, headers);
    return fetch(`${base}/oauth/access_token`, {
      method: 'POST',
      body: JSON.stringify({
        phone_email_or_username: phoneEmailUsername,
        client_id: 1,
        password: password
      }),
      headers: {
        'device-id': deviceId,
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  let access: Access;
  if (process.env.access) {
    access = JSON.parse(process.env.access);
  } else {
    const ans = await login(input.phone_email_or_username, input.password);
    if (ans.ok) {
      access = await ans.json();
    } else {
      const otpSecret = ans.headers.get('venmo-otp-secret');
      if (!otpSecret) return;
      const twoFactorResponse = await fetch(`${base}/account/two-factor/token`, {
        method: 'POST',
        body: JSON.stringify({
          via: "sms"
        }),
        headers: {
          'device-id': deviceId,
          'venmo-otp-secret': otpSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!twoFactorResponse.ok) return;

      const otpCode = await new Promise((res) => {
        readline.createInterface({
          input: process.stdin,
          output: process.stdout
        }).question('Enter OTP code:', (answer) => res(answer))
      });
      const ans2 = await login(input.phone_email_or_username, input.password, {
        'venmo-otp-secret': otpSecret,
        'venmo-otp': otpCode
      });
      access = await ans2.json();
      if (!ans2.ok) return;
    }

    process.env.access = JSON.stringify(access);
  }
  console.log(access);

  const request = async (method, path, body?): Promise<any> => {
    console.log('->', path, body);
    const response = await fetch(`${base}/${path}`, {
      method: method,
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${access?.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('<-', response);
    return response.json();
  }

  const usernames: string[] = input.usernames.split(',');
  for (const username of usernames) {
    const searchResponse = await request('GET', `users?query=${username}&limit=10&offset=0`);
    const user = searchResponse.data.find((user) => user.username.toLowerCase() === username)
    console.log('user', user);


    await request('POST', `payments`, {
      user_id: user.id,
      audience: "private",
      amount: '1.23',
      note: "The transaction note."
    });
  }
};

export default run;
