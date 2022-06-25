
export interface Input {
    token: string;
    phone_email_or_username: string;
    usernames: string;
    password: string;
}

export interface Access {
    access_token: string;
    expires_in: number;
    token_type: string;
    user: User;
    balance: number;
    refresh_token: string;
}

export interface User {
    username: string;
    last_name: string;
    friends_count: number;
    is_group: boolean;
    is_active: boolean;
    trust_request: null;
    is_venmo_team: boolean;
    phone: string;
    profile_picture_url: string;
    is_payable: boolean;
    is_blocked: boolean;
    id: string;
    identity: null;
    date_joined: string;
    about: string;
    display_name: string;
    identity_type: string;
    audience: string;
    first_name: string;
    friend_status: null;
    email: string;
}