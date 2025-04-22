import { 
  users, type User, type InsertUser,
  geeScripts, type GeeScript, type InsertGeeScript,
  analysisResults, type AnalysisResult, type InsertAnalysisResult
} from "@shared/schema";

// IStorage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // GEE Script operations
  getScript(id: number): Promise<GeeScript | undefined>;
  getScriptsByUser(userId: number): Promise<GeeScript[]>;
  getPublicScripts(): Promise<GeeScript[]>;
  createScript(script: InsertGeeScript): Promise<GeeScript>;
  
  // Analysis Result operations
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  getAnalysisResultsByUser(userId: number): Promise<AnalysisResult[]>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scripts: Map<number, GeeScript>;
  private analysisResults: Map<number, AnalysisResult>;
  
  private userIdCounter: number;
  private scriptIdCounter: number;
  private analysisResultIdCounter: number;

  constructor() {
    this.users = new Map();
    this.scripts = new Map();
    this.analysisResults = new Map();
    
    this.userIdCounter = 1;
    this.scriptIdCounter = 1;
    this.analysisResultIdCounter = 1;
    
    // Initialize with predefined GEE scripts
    this.initializeScripts();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // GEE Script operations
  async getScript(id: number): Promise<GeeScript | undefined> {
    return this.scripts.get(id);
  }
  
  async getScriptsByUser(userId: number): Promise<GeeScript[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.createdById === userId,
    );
  }
  
  async getPublicScripts(): Promise<GeeScript[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.isPublic,
    );
  }
  
  async createScript(insertScript: InsertGeeScript): Promise<GeeScript> {
    const id = this.scriptIdCounter++;
    const createdAt = new Date().toISOString();
    const script: GeeScript = { ...insertScript, id, createdAt };
    this.scripts.set(id, script);
    return script;
  }
  
  // Analysis Result operations
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }
  
  async getAnalysisResultsByUser(userId: number): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values()).filter(
      (result) => result.userId === userId,
    );
  }
  
  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.analysisResultIdCounter++;
    const createdAt = new Date().toISOString();
    const result: AnalysisResult = { ...insertResult, id, createdAt };
    this.analysisResults.set(id, result);
    return result;
  }
  
  // Initialize with predefined GEE scripts
  private initializeScripts() {
    const defaultScripts: Omit<GeeScript, 'id'>[] = [
      {
        name: 'Calculate EC from Sentinel-2',
        description: 'Calculates Electrical Conductivity (EC) using Sentinel-2 imagery',
        scriptType: 'calculateEC',
        code: `// Sentinel-2 EC calculation GEE script 
        // This is a placeholder for actual GEE script code
        var sentinel2 = ee.ImageCollection('COPERNICUS/S2');
        var salinity = sentinel2.calculate_ec();
        `,
        createdById: null,
        isPublic: true,
        parameters: {
          bands: ['B4', 'B8', 'B11'],
          indices: ['NDSI', 'SAVI']
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Estimate SAR from Landsat',
        description: 'Estimates Sodium Adsorption Ratio (SAR) using Landsat imagery',
        scriptType: 'estimateSAR',
        code: `// Landsat SAR estimation GEE script
        // This is a placeholder for actual GEE script code
        var landsat = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA');
        var sar = landsat.estimate_sar();
        `,
        createdById: null,
        isPublic: true,
        parameters: {
          bands: ['B4', 'B5', 'B7'],
          indices: ['NDSI', 'SI']
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Detect Salt-Affected Soils',
        description: 'Detects salt-affected soils using multi-spectral imagery',
        scriptType: 'detectSaltAffectedSoils',
        code: `// Salt-affected soil detection GEE script
        // This is a placeholder for actual GEE script code
        var sentinel2 = ee.ImageCollection('COPERNICUS/S2');
        var saltAffected = sentinel2.detect_salt_affected_regions();
        `,
        createdById: null,
        isPublic: true,
        parameters: {
          threshold: 0.45,
          indices: ['SI', 'NDSI', 'BSI']
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Analyze Historical Trends',
        description: 'Analyzes historical trends in soil salinity over time',
        scriptType: 'analyzeHistoricalTrends',
        code: `// Historical trend analysis GEE script
        // This is a placeholder for actual GEE script code
        var landsat = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
          .filterDate('2018-01-01', '2023-01-01');
        var trends = landsat.analyzeTimeSeries();
        `,
        createdById: null,
        isPublic: true,
        parameters: {
          startYear: 2018,
          endYear: 2023,
          temporalResolution: 'monthly'
        },
        createdAt: new Date().toISOString()
      }
    ];
    
    // Add scripts to the scripts map
    defaultScripts.forEach(script => {
      const id = this.scriptIdCounter++;
      const scriptWithId = { ...script, id };
      this.scripts.set(id, scriptWithId as GeeScript);
    });
  }
}

export const storage = new MemStorage();
