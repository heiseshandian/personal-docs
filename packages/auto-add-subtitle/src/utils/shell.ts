import { callback2Promise } from './base';
import { exec } from 'child_process';

export const execAsync = callback2Promise<[string, string]>(exec);
