/* -------------------------------------------------------------------------- */
/*                     SERVER-SIDE PRODUCT DATA (PRICING)                      */
/* -------------------------------------------------------------------------- */
//
// ⚠️  IMPORTANT — KEEP IN SYNC ⚠️
// This file is the SERVER-SIDE source of truth for product pricing.
// Stripe will charge the prices listed HERE, not the ones in the frontend.
//
// If you add, remove, or change a product's price, you MUST also update the
// corresponding entry in the frontend file:  script.js → productDatabase
//
// Conversely, if you update productDatabase in script.js, update this file too.
//
// Failure to keep both files in sync will cause price mismatches between
// what the customer sees on the site and what Stripe actually charges.
/* -------------------------------------------------------------------------- */

const serverProductData = {
    // VASE SERIES (Signature)
    'v_japandi':          { title: 'Japandi Vase',              price: 40.00 },
    'v_twisted_elegant':  { title: 'Twisted Elegant Vase',      price: 38.00 },
    'v_striped':          { title: 'Striped Vase',              price: 45.00 },
    'v_other_striped':    { title: 'Other Striped Vase',        price: 42.00 },
    'v_modern_bowl':      { title: 'Modern Bowl',               price: 30.00 },

    // STRUCTURAL SERIES (Signature)
    's_bridge':   { title: 'Suspension Bridge Node',    price: 320.00 },
    's_beam':     { title: 'I-Beam Stress Map',         price: 190.00 },
    's_dome':     { title: 'Geodesic Dome Joint',       price: 210.00 },
    's_sky':      { title: 'The Skyscraper Core',       price: 280.00 },
    's_cant':     { title: 'Cantilever Reinforcement',  price: 175.00 },
    's_truss':    { title: 'Steel Truss Geometry',      price: 165.00 },
    's_dam':      { title: 'Buttress Dam Section',      price: 240.00 },
    's_isolator': { title: 'Seismic Isolator',          price: 295.00 },

    // AEROSPACE SERIES (Signature)
    'a_falcon':  { title: 'Falcon Trajectory',      price: 260.00 },
    'a_naca':    { title: 'NACA 2412 Airfoil',      price: 185.00 },
    'a_nozzle':  { title: 'Rocket Nozzle Bell',     price: 230.00 },
    'a_inlet':   { title: 'SR-71 Inlet Spike',      price: 310.00 },
    'a_heli':    { title: 'Helicopter Rotor Head',   price: 275.00 },
    'a_station': { title: 'Space Station Module',    price: 350.00 },
    'a_solar':   { title: 'Satellite Solar Array',   price: 210.00 },
    'a_lander':  { title: 'Landing Hexapod',         price: 295.00 },

    // ESSENTIALS COLLECTION
    'e_corner_shelf': { title: 'Multi Tier Corner Shelf', price: 25.00 }
};

module.exports = serverProductData;
