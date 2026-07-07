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

    // FIDGET SERIES (Signature)
    'f_gyroscope_fidget': { title: 'Gyroscope Fidget', price: 20.00 },
    'f_square_gyroscope': { title: 'Square Gyroscope Fidget', price: 20.00 },
    'f_gyro_spinner': { title: 'Gyro Spinner', price: 20.00 },
    'f_clicker_ring': { title: 'Clicker Ring', price: 15.00 },
    'f_tangle_twister': { title: 'Tangle Twister', price: 18.00 },
    'f_pop_puck': { title: 'Pop Puck', price: 22.00 },
    'f_gear_cube': { title: 'Gear Cube', price: 35.00 },
    'f_chain_link': { title: 'Chain Link Fidget', price: 12.00 },

    // TRAY SERIES (Signature)
    't_hexagonal': { title: 'Hexagonal Catch-all Tray', price: 25.00 },
    't_minimalist_valet': { title: 'Minimalist Valet Tray', price: 30.00 },
    't_geometric_desk': { title: 'Geometric Desk Tray', price: 20.00 },
    't_ripple_effect': { title: 'Ripple Effect Key Tray', price: 18.00 },
    't_tiered_organizer': { title: 'Tiered Organizer Tray', price: 35.00 },
    't_oval_vanity': { title: 'Oval Vanity Tray', price: 28.00 },
    't_angular_display': { title: 'Angular Display Tray', price: 22.00 },
    't_stackable_sorting': { title: 'Stackable Sorting Trays', price: 40.00 },

    // ESSENTIALS COLLECTION
    'e_corner_shelf': { title: 'Multi Tier Corner Shelf', price: 25.00 }
};

module.exports = serverProductData;
