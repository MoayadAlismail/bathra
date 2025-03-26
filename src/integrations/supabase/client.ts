
// Mock Supabase client for demo purposes
const createMockResponse = (data: any = null, error: any = null) => ({
  data,
  error,
});

// Demo database with sample data
const demoDb = {
  investors: [
    {
      id: 'demo-investor-id',
      email: 'demo@investor.com',
      name: 'Demo Investor',
      investment_focus: 'Technology',
      investment_range: '$50K - $200K (Angel)',
      account_type: 'individual',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-vc-id',
      email: 'demo@vc.com',
      name: 'Demo VC Fund',
      investment_focus: 'CleanTech, HealthTech',
      investment_range: '$1M+ (Series B+)',
      account_type: 'vc',
      created_at: new Date().toISOString()
    }
  ],
  startups: [
    {
      id: "demo-startup-1",
      name: "EcoSolutions",
      industry: "CleanTech",
      stage: "Seed",
      description: "Developing sustainable energy solutions for residential buildings.",
      website: "https://ecosolutions-demo.com",
      founders: "Jane Smith, John Doe",
      team_size: "5-10",
      valuation: "2.5M",
      raised: 750000,
      roi: 22,
      status: "vetted",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1473893604213-3df9c15611c0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: "demo-startup-2",
      name: "MediTech",
      industry: "HealthTech",
      stage: "Series A",
      description: "AI-powered diagnostic tools for early disease detection.",
      website: "https://meditech-demo.com",
      founders: "Alex Johnson, Maria Garcia",
      team_size: "10-20",
      valuation: "8M",
      raised: 2500000,
      roi: 35,
      status: "vetted",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: "demo-startup-3",
      name: "FintechPro",
      industry: "Fintech",
      stage: "Seed",
      description: "Blockchain-based payment solutions for small businesses.",
      website: "https://fintechpro-demo.com",
      founders: "Sam Wilson",
      team_size: "2-5",
      valuation: "1.2M",
      raised: 300000,
      roi: 18,
      status: "pending",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
  ]
};

// Mock functions to simulate Supabase API
export const supabase = {
  auth: {
    getSession: async () => createMockResponse({ session: null }),
    getUser: async () => createMockResponse({ user: null }),
    signInWithPassword: async ({ email, password }: any) => {
      console.log(`Mock login attempt with ${email}`);
      return createMockResponse({ user: null, session: null }, { message: 'Not implemented in demo mode' });
    },
    signInWithOAuth: async ({ provider }: any) => {
      console.log(`Mock OAuth login with ${provider}`);
      return createMockResponse(null, { message: 'Not implemented in demo mode' });
    },
    signUp: async ({ email, password, options }: any) => {
      console.log(`Mock signup with ${email}`);
      return createMockResponse({ user: null }, { message: 'Not implemented in demo mode' });
    },
    updateUser: async (updates: any) => {
      console.log('Mock update user', updates);
      return createMockResponse({ user: null }, null);
    },
    signOut: async () => {
      console.log('Mock sign out');
      return createMockResponse(null, null);
    },
    onAuthStateChange: (callback: any) => {
      console.log('Mock auth state change subscription');
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('Mock unsubscribe from auth changes')
          }
        }
      };
    },
  },
  from: (table: string) => {
    const data = demoDb[table as keyof typeof demoDb] || [];
    let filteredData = [...data];
    let query = {
      eq: (column: string, value: any) => {
        filteredData = filteredData.filter((item: any) => item[column] === value);
        return query;
      },
      neq: (column: string, value: any) => {
        filteredData = filteredData.filter((item: any) => item[column] !== value);
        return query;
      },
      limit: (count: number) => {
        filteredData = filteredData.slice(0, count);
        return query;
      },
      order: (column: string, { ascending = true }: { ascending?: boolean } = {}) => {
        filteredData.sort((a: any, b: any) => {
          if (ascending) {
            return a[column] > b[column] ? 1 : -1;
          } else {
            return a[column] < b[column] ? 1 : -1;
          }
        });
        return query;
      },
      select: (columns?: string) => {
        if (columns) {
          const selectedFields = columns.split(',').map(f => f.trim());
          filteredData = filteredData.map((item: any) => {
            const newItem: any = {};
            selectedFields.forEach(field => {
              if (field === '*') {
                Object.assign(newItem, item);
              } else {
                newItem[field] = item[field];
              }
            });
            return newItem;
          });
        }
        return {
          data: filteredData,
          error: null,
          single: () => {
            return {
              data: filteredData.length > 0 ? filteredData[0] : null,
              error: filteredData.length === 0 ? { message: 'No data found' } : null
            };
          }
        };
      },
      insert: (newData: any) => {
        console.log('Insert data:', newData);
        return createMockResponse({ id: 'new-mock-id' }, null);
      },
      update: (updates: any) => {
        console.log('Update data:', updates);
        return createMockResponse(null, null);
      },
      delete: () => {
        console.log('Delete data from', table);
        return createMockResponse(null, null);
      }
    };
    return query;
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log(`Mock file upload to ${bucket}/${path}`);
        return createMockResponse({ path }, null);
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` } };
      },
      list: async (prefix: string) => {
        return createMockResponse({ data: [] }, null);
      },
      remove: async (paths: string[]) => {
        console.log(`Mock file removal from ${bucket}:`, paths);
        return createMockResponse(null, null);
      }
    })
  },
  channel: (channel: string) => {
    return {
      on: (event: string, config: any, callback: Function) => {
        console.log(`Mock subscribe to ${event} on ${channel}`);
        return {
          subscribe: () => console.log(`Mock subscribe called for ${channel}`)
        };
      }
    };
  },
  removeChannel: (channel: any) => {
    console.log('Mock remove channel');
  }
};
