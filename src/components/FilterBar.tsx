'use client';

import { useState,useEffect } from 'react';
import { Search,X } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useTaskStats } from '@/stores/selectors';
import { cn } from '@/lib/utils';
import type { FilterStatus,SortOption } from '@/types';

const FILTER: {value:FilterStatus;label:string}[]=[
    {value:'all',label:'All'},
    {value:'ac'}
]