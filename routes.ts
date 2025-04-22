import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { insertUserSchema, insertGeeScriptSchema, insertAnalysisResultSchema } from "@shared/schema";

// Sample data for salinity-precipitation trends based on the provided GEE script
const salinityPrecipitationData = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  salinity: [1.010, 0.985, 1.055, 1.060, 1.015, 1.060, 1.050, 1.090, 1.045, 1.105, 1.140],
  precipitation: [405, 470, 380, 395, 455, 410, 420, 390, 435, 375, 350]
};

// Sample data for annual salinity index based on the provided GEE script
const annualSalinityIndexData = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  si: [0.97, 0.95, 1.02, 1.05, 1.01, 1.03, 1.04, 1.08, 1.09, 1.12, 1.15]
};

// GEE Script execution handler
function handleGeeScriptExecution(scriptType: string) {
  // Get script content
  let scriptInfo;
  let scriptResult;

  switch (scriptType) {
    case 'calculateEC':
      scriptInfo = {
        name: 'Calculate EC from Sentinel-2',
        description: 'Calculates Electrical Conductivity (EC) using Sentinel-2 imagery',
        region: 'Algeria',
        resultType: 'ec'
      };
      
      scriptResult = {
        ec_values: [0.43, 0.75, 0.91, 1.22, 1.85, 2.3],
        avg_ec: 1.24,
        units: 'dS/m',
        region: 'Algeria Test Site',
        timestamp: new Date().toISOString()
      };
      break;
    
    case 'estimateSAR':
      scriptInfo = {
        name: 'Estimate SAR from Landsat',
        description: 'Estimates Sodium Adsorption Ratio (SAR) using Landsat imagery',
        region: 'Algeria',
        resultType: 'sar'
      };
      
      scriptResult = {
        sar_values: [3.2, 5.4, 7.8, 10.2, 12.5, 15.1],
        avg_sar: 9.03,
        region: 'Algeria Test Site',
        timestamp: new Date().toISOString()
      };
      break;
    
    case 'detectSaltAffectedSoils':
      scriptInfo = {
        name: 'Detect Salt-Affected Soils',
        description: 'Detects salt-affected soils using multi-spectral imagery',
        region: 'Algeria',
        resultType: 'salt_affected'
      };
      
      scriptResult = {
        affected_area: 325.7, // hectares
        percentage_affected: 47.3,
        severity_levels: {
          severe: 18.2,
          moderate: 42.6,
          mild: 39.2
        },
        region: 'Algeria Test Site',
        timestamp: new Date().toISOString()
      };
      break;
    
    case 'analyzeHistoricalTrends':
      scriptInfo = {
        name: 'Analyze Historical Trends',
        description: 'Analyzes historical trends in soil salinity over time',
        region: 'Algeria',
        resultType: 'historical_trends'
      };
      
      scriptResult = {
        time_series: {
          years: salinityPrecipitationData.years,
          salinity: salinityPrecipitationData.salinity,
          precipitation: salinityPrecipitationData.precipitation
        },
        correlation: -0.73, // Negative correlation between precipitation and salinity
        trend_slope: 0.015, // Positive trend in salinity over time
        region: 'Algeria Test Site',
        timestamp: new Date().toISOString()
      };
      break;
    
    default:
      return {
        status: 'error',
        error: 'Unsupported script type'
      };
  }

  return {
    status: 'success',
    script: scriptInfo,
    result: scriptResult
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with '/api' prefix
  
  // User routes
  app.post('/api/users/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating user' });
      }
    }
  });
  
  // GEE Script routes
  app.get('/api/scripts', async (req: Request, res: Response) => {
    try {
      const scripts = await storage.getPublicScripts();
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching scripts' });
    }
  });
  
  app.get('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid script ID' });
      }
      
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      res.json(script);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching script' });
    }
  });
  
  app.post('/api/scripts', async (req: Request, res: Response) => {
    try {
      const scriptData = insertGeeScriptSchema.parse(req.body);
      const newScript = await storage.createScript(scriptData);
      res.status(201).json(newScript);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid script data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating script' });
      }
    }
  });
  
  // GEE Script Execution Route
  app.post('/api/gee/execute', (req: Request, res: Response) => {
    try {
      const { scriptType, region, startDate, endDate, additionalParams } = req.body;
      
      if (!scriptType) {
        return res.status(400).json({ 
          status: 'error', 
          error: 'Script type is required' 
        });
      }
      
      // Process the GEE script based on type
      const result = handleGeeScriptExecution(scriptType);
      
      if (result.status === 'error') {
        return res.status(400).json(result);
      }
      
      // Create analysis result record in storage
      const analysisResultData = {
        userId: null,
        scriptId: 1, // Default script ID
        parameters: {
          scriptType,
          region,
          startDate,
          endDate,
          additionalParams
        },
        results: result.result,
        status: 'completed',
        region: region || "Algeria Region"
      };
      
      // In a real implementation, we'd save the result to the database
      // const savedResult = await storage.createAnalysisResult(analysisResultData);
      
      res.json({
        status: 'success',
        data: result.result
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    }
  });

  // Analysis routes
  app.post('/api/analysis/run', async (req: Request, res: Response) => {
    try {
      const { scriptId, parameters, region } = req.body;
      
      if (!scriptId || !parameters) {
        return res.status(400).json({ message: 'Script ID and parameters are required' });
      }
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: 'Script not found' });
      }
      
      // In a real implementation, this would execute the GEE script
      // For now, we'll simulate the analysis with a placeholder result
      
      const analysisResult = {
        userId: req.body.userId || null,
        scriptId,
        parameters,
        results: {
          selectedArea: region?.name || "Algeria Test Site",
          averageSalinity: 5.7,
          affectedArea: 467.3,
          confidenceLevel: 82
        },
        status: 'completed',
        region: region || null,
      };
      
      const savedResult = await storage.createAnalysisResult(analysisResult);
      res.status(201).json(savedResult);
    } catch (error) {
      res.status(500).json({ message: 'Error running analysis' });
    }
  });
  
  app.get('/api/analysis/results', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      if (userId) {
        const results = await storage.getAnalysisResultsByUser(userId);
        res.json(results);
      } else {
        res.status(400).json({ message: 'User ID is required' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analysis results' });
    }
  });
  
  app.get('/api/analysis/results/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid result ID' });
      }
      
      const result = await storage.getAnalysisResult(id);
      if (!result) {
        return res.status(404).json({ message: 'Analysis result not found' });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analysis result' });
    }
  });

  // Route to get time series data for salinity-precipitation analysis
  app.get('/api/data/salinity-precipitation', (req: Request, res: Response) => {
    res.json(salinityPrecipitationData);
  });

  // Route to get annual salinity index data
  app.get('/api/data/salinity-index', (req: Request, res: Response) => {
    res.json(annualSalinityIndexData);
  });

  // OpenRouter AI Analysis endpoint
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { system_prompt, user_prompt, model = "anthropic/claude-3-haiku" } = req.body;
      
      if (!system_prompt || !user_prompt) {
        return res.status(400).json({ 
          error: "Missing required parameters: system_prompt and user_prompt are required" 
        });
      }

      // Check if API key is available
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "OpenRouter API key is not configured" 
        });
      }

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://replit.com',
          'X-Title': 'GaiaDex Soil Salinity Analysis'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: system_prompt
            },
            {
              role: "user",
              content: user_prompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API error:", errorData);
        return res.status(response.status).json({ 
          error: "Error from OpenRouter API", 
          details: errorData 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in AI analysis:", error);
      res.status(500).json({ 
        error: "Internal server error during AI analysis",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
