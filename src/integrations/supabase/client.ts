
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
      founded_date: "2021-03-15",
      target_market: "Residential property owners",
      problem_solved: "High energy costs and carbon footprint for homeowners",
      usp: "Proprietary solar integration system with 30% higher efficiency",
      traction: "500+ installations in California, growing 25% month-over-month",
      key_metrics: "Customer acquisition cost: $200, LTV: $3,500",
      previous_funding: "$750,000 angel investment",
      funding_required: "$2.5M",
      valuation: "8M",
      use_of_funds: "Expand to 5 new states and improve manufacturing capacity",
      roadmap: "Q3 2023: Launch new product line, Q1 2024: Series A, Q4 2024: International expansion",
      exit_strategy: "Acquisition by major energy company or IPO within 5-7 years",
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
      founded_date: "2020-05-01",
      target_market: "Hospitals and medical clinics",
      problem_solved: "Delayed diagnostics leading to worse patient outcomes",
      usp: "95% accuracy in early-stage disease detection, 5x faster than traditional methods",
      traction: "In use at 20+ hospitals, 15,000+ patients diagnosed",
      key_metrics: "$1.2M ARR, 92% retention rate",
      previous_funding: "$2.5M Seed",
      funding_required: "$8M",
      valuation: "30M",
      use_of_funds: "Scale sales team and develop two new diagnostic products",
      roadmap: "Q2 2023: FDA approval for new product, Q1 2024: European market entry",
      exit_strategy: "Strategic acquisition by medical device company",
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
      founded_date: "2022-01-15",
      target_market: "Small and medium-sized businesses",
      problem_solved: "High transaction fees and slow settlement times for cross-border payments",
      usp: "Zero fee transactions, settlement in under 3 seconds",
      traction: "500 businesses onboarded, $1M monthly transaction volume",
      key_metrics: "$30K MRR, 8% MoM growth",
      previous_funding: "$300K pre-seed",
      funding_required: "$1.5M",
      valuation: "6M",
      use_of_funds: "Product development and marketing expansion",
      roadmap: "Q4 2023: Launch mobile app, Q2 2024: Expand to LATAM",
      exit_strategy: "Acquisition by major payment processor or Series A+",
      status: "vetted",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: "demo-startup-4",
      name: "AgriTech Solutions",
      industry: "AgTech",
      stage: "Seed",
      description: "Smart farming solutions using IoT sensors and AI analytics.",
      website: "https://agritech-demo.com",
      founders: "Emma Peterson, David Kim",
      team_size: "5-10",
      founded_date: "2021-09-10",
      target_market: "Commercial farms and agricultural cooperatives",
      problem_solved: "Inefficient resource usage and crop yield optimization",
      usp: "Increases crop yields by 35% while reducing water usage by 40%",
      traction: "Deployed on 25 farms across 3 states, covering 5,000+ acres",
      key_metrics: "$450K ARR, 95% customer retention",
      previous_funding: "$500K angel investment",
      funding_required: "$2M",
      valuation: "7M",
      use_of_funds: "Scale technology deployment and expand to new regions",
      roadmap: "Q1 2024: Launch predictive analytics module, Q3 2024: International pilot",
      exit_strategy: "Strategic acquisition by agricultural technology company",
      status: "vetted",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: "demo-startup-5",
      name: "EdTech Innovations",
      industry: "Education Technology",
      stage: "Series A",
      description: "Personalized learning platform using AI to adapt to individual student needs.",
      website: "https://edtech-demo.com",
      founders: "Robert Chen, Lisa Johnson",
      team_size: "20-50",
      founded_date: "2019-07-22",
      target_market: "K-12 schools and educational institutions",
      problem_solved: "One-size-fits-all education failing to meet diverse student needs",
      usp: "Adaptive learning algorithms that improve student outcomes by 40%",
      traction: "Used by 150+ schools reaching 50,000+ students",
      key_metrics: "$3.2M ARR, 85% YoY growth",
      previous_funding: "$4M Seed",
      funding_required: "$10M",
      valuation: "45M",
      use_of_funds: "Product development and international expansion",
      roadmap: "Q4 2023: Launch higher education platform, Q2 2024: Enter Asian markets",
      exit_strategy: "IPO or strategic acquisition by major education company",
      status: "vetted",
      created_at: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
  ],
  subscribed_emails: [
    { id: '1', email: 'john.doe@example.com', created_at: new Date().toISOString() },
    { id: '2', email: 'jane.smith@example.com', created_at: new Date().toISOString() },
    { id: '3', email: 'michael.johnson@example.com', created_at: new Date().toISOString() },
    { id: '4', email: 'susan.williams@example.com', created_at: new Date().toISOString() },
    { id: '5', email: 'david.brown@example.com', created_at: new Date().toISOString() },
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
    console.log(`Querying table: ${table}`);
    const data = demoDb[table as keyof typeof demoDb] || [];
    let filteredData = [...data];
    
    return {
      select: (columns?: string) => {
        console.log(`Selecting columns: ${columns || '*'}`);
        let selectedData = filteredData;
        
        if (columns) {
          const selectedFields = columns.split(',').map(f => f.trim());
          selectedData = filteredData.map((item: any) => {
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
          eq: (column: string, value: any) => {
            console.log(`Filtering where ${column} = ${value}`);
            const filtered = selectedData.filter((item: any) => item[column] === value);
            return {
              data: filtered.length > 0 ? filtered : [],
              error: null,
              single: () => ({
                data: filtered.length > 0 ? filtered[0] : null,
                error: filtered.length === 0 ? { message: 'No data found' } : null
              })
            };
          },
          
          neq: (column: string, value: any) => {
            console.log(`Filtering where ${column} != ${value}`);
            const filtered = selectedData.filter((item: any) => item[column] !== value);
            return {
              data: filtered,
              error: null
            };
          },
          
          order: (column: string, { ascending = true }: { ascending?: boolean } = {}) => {
            console.log(`Ordering by ${column} ${ascending ? 'ASC' : 'DESC'}`);
            const sorted = [...selectedData].sort((a: any, b: any) => {
              if (ascending) {
                return a[column] > b[column] ? 1 : -1;
              } else {
                return a[column] < b[column] ? 1 : -1;
              }
            });
            return {
              data: sorted,
              error: null,
              limit: (count: number) => {
                console.log(`Limiting to ${count} results`);
                const limited = sorted.slice(0, count);
                return {
                  data: limited,
                  error: null
                };
              }
            };
          },
          
          limit: (count: number) => {
            console.log(`Limiting to ${count} results`);
            const limited = selectedData.slice(0, count);
            return {
              data: limited,
              error: null
            };
          },
          
          single: () => {
            console.log('Getting single result');
            return {
              data: selectedData.length > 0 ? selectedData[0] : null,
              error: selectedData.length === 0 ? { message: 'No data found' } : null
            };
          },
          
          data: selectedData,
          error: null
        };
      },
      
      eq: (column: string, value: any) => {
        console.log(`Filtering where ${column} = ${value}`);
        const filtered = filteredData.filter((item: any) => item[column] === value);
        return {
          select: (columns?: string) => {
            let selectedData = filtered;
            
            if (columns) {
              const selectedFields = columns.split(',').map(f => f.trim());
              selectedData = filtered.map((item: any) => {
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
              data: selectedData,
              error: null
            };
          },
          data: filtered,
          error: null,
          single: () => ({
            data: filtered.length > 0 ? filtered[0] : null,
            error: filtered.length === 0 ? { message: 'No data found' } : null
          })
        };
      },
      
      neq: (column: string, value: any) => {
        console.log(`Filtering where ${column} != ${value}`);
        const filtered = filteredData.filter((item: any) => item[column] !== value);
        return {
          data: filtered,
          error: null
        };
      },
      
      order: (column: string, { ascending = true }: { ascending?: boolean } = {}) => {
        console.log(`Ordering by ${column} ${ascending ? 'ASC' : 'DESC'}`);
        const sorted = [...filteredData].sort((a: any, b: any) => {
          if (ascending) {
            return a[column] > b[column] ? 1 : -1;
          } else {
            return a[column] < b[column] ? 1 : -1;
          }
        });
        return {
          limit: (count: number) => {
            console.log(`Limiting to ${count} results`);
            const limited = sorted.slice(0, count);
            return {
              select: () => ({
                data: limited,
                error: null
              }),
              data: limited,
              error: null
            };
          },
          select: () => ({
            data: sorted,
            error: null
          }),
          data: sorted,
          error: null
        };
      },
      
      limit: (count: number) => {
        console.log(`Limiting to ${count} results`);
        const limited = filteredData.slice(0, count);
        return {
          data: limited,
          error: null
        };
      },
      
      insert: (newData: any) => {
        console.log('Insert data:', newData);
        if (Array.isArray(newData)) {
          // Generate IDs for new records
          const newRecords = newData.map((item, index) => ({
            id: `new-mock-id-${Date.now()}-${index}`,
            ...item,
            created_at: new Date().toISOString()
          }));
          
          // Add to our mock database
          if (demoDb[table as keyof typeof demoDb]) {
            (demoDb[table as keyof typeof demoDb] as any[]).push(...newRecords);
          } else {
            (demoDb as any)[table] = newRecords;
          }
          
          return createMockResponse(newRecords, null);
        } else {
          const newRecord = {
            id: `new-mock-id-${Date.now()}`,
            ...newData,
            created_at: new Date().toISOString()
          };
          
          // Add to our mock database
          if (demoDb[table as keyof typeof demoDb]) {
            (demoDb[table as keyof typeof demoDb] as any[]).push(newRecord);
          } else {
            (demoDb as any)[table] = [newRecord];
          }
          
          return createMockResponse(newRecord, null);
        }
      },
      
      update: (updates: any) => {
        console.log('Update data:', updates);
        return createMockResponse({ ...updates }, null);
      },
      
      delete: () => {
        console.log('Delete data from', table);
        return createMockResponse(null, null);
      }
    };
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
  },
  functions: {
    invoke: (fn: string, options: any) => {
      console.log(`Mock invoke function: ${fn} with options:`, options);
      return createMockResponse({ data: 'Mock function response' }, null);
    }
  }
};
