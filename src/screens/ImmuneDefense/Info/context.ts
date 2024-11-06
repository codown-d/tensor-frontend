import { createContext } from 'react';
import { LearnParamsRes } from './useData';

export const ImmuneDefenseContext = createContext<LearnParamsRes>({} as LearnParamsRes);
