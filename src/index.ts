require('dotenv').config();

import { Client } from './structures/client';

export const client = new Client();

client.start();
