
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://humbri.com'; // Replace with your actual domain
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const staticRoutes = [
    '/',
    '/auth',
    '/properties',
    '/map',
    '/host-info',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy',
];

async function generateSitemap() {
    console.log('Generating sitemap...');

    try {
        // Fetch dynamic content (Active Properties)
        // Assuming 'properties' table and 'id' column. Filter by status='published' if applicable.
        // Adjust the query based on your actual schema.
        const { data: properties, error } = await supabase
            .from('properties')
            .select('id')
        // .eq('status', 'published'); // Uncomment if you have a status field

        if (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }

        const dynamicRoutes = properties ? properties.map(p => `/property/${p.id}`) : [];
        const allRoutes = [...staticRoutes, ...dynamicRoutes];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
                .map((route) => {
                    return `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
                })
                .join('')}
</urlset>`;

        const publicDir = path.resolve(__dirname, '../public');
        const sitemapPath = path.join(publicDir, 'sitemap.xml');

        // Ensure public directory exists
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        fs.writeFileSync(sitemapPath, sitemap);
        console.log(`Sitemap generated successfully at ${sitemapPath}`);
        console.log(`Total URLs: ${allRoutes.length}`);

    } catch (err) {
        console.error('Failed to generate sitemap:', err);
        process.exit(1);
    }
}

generateSitemap();
