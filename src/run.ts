import * as core from '@actions/core';
import { Venmo } from "venmo-typescript";

export interface Input {
  token: string;
  phone_email_or_username: string;
  password: string;
  recipients: string;
  amount: number;
  note: string;
  audience: 'public' | 'private';
  otp?: string;
  otpSecret?: string;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.phone_email_or_username = core.getInput('phone_email_or_username');
  result.password = core.getInput('password');
  result.recipients = core.getInput('recipients');
  result.amount = parseInt(core.getInput('amount'));
  result.note = core.getInput('note');
  result.audience = core.getInput('audience') === 'public' ? 'public' : 'private';
  result.otp = core.getInput('otp');
  result.otpSecret = core.getInput('otp_secret');
  return result;
}

const run = async (): Promise<void> => {
  const input = getInputs();
  const v = new Venmo();

  try {
    if (input.otp) {
      v.twoFactorToken(input.otp);
      try {
        await v.login(input.phone_email_or_username, input.password, {
          'venmo-otp-secret': input.otpSecret,
          'venmo-otp': input.otp
        });
      } catch {
        throw new Error('Two factor failed. Check code.');
      }
    } else {
      const loginRes = await v.login(input.phone_email_or_username, input.password);
      if (loginRes && !loginRes.ok) {
        const otpSecret = loginRes.headers.get('venmo-otp-secret');
        if (!otpSecret) {
          throw new Error('No otp secret');
        }
        const otpRes = await v.twoFactorToken(otpSecret);
        if (!otpRes.ok) {
          throw new Error('Two factor request failed');
        }
        core.setOutput('otp', otpSecret);
      }
    }
    const recipients: string[] = input.recipients.split(',');
    for (const username of recipients) {
      const users = await v.userQuery(username);
      const user = users.find((user) => user.username.toLowerCase() === username.toLowerCase())
      if (!user) {
        core.warning(`User ${username} not found`);
        continue;
      }
      const paymentResponse = await v.pay(user.id, input.amount, input.note, input.audience);
      if (paymentResponse) {
        core.info(`${input.amount > 0 ? 'Paid' : 'Requested'} ${input.amount} from ${username} successfully`);
      }
    }
  } catch (err) {
    core.error(err instanceof Error ? err.message : JSON.stringify(err));
  }
};

export default run;
