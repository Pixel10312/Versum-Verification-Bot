require('dotenv').config();
require('module-alias/register');

import { ExtendedClient } from './structures/client';

export const client = new ExtendedClient();

client.start();
