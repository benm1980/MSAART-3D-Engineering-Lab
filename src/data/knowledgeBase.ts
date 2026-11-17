import type { KnowledgeItem, PartNoteEntry } from '../types/msaart';

export const PART_NOTES: Record<string, PartNoteEntry> = {
  vajra_outer_4: {
    id: 'vajra_outer_4',
    name: '4-Inch Outer 304 Gazing Shell',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: '304 Stainless Steel (Mirror-Polished Hemisphere, 1.5–2.4 mm wall)',
    dimensions: '4.00" OD × 3.81" ID · 0.095" wall gauge',
    functionalPurpose:
      'Forms the outer boundary of the 4"–3" annular counter-rotating vortex chamber and houses the closed outer poles of the twin 432 Stubby Vajra.',
    bendallNotes:
      'Malcolm Bendall specifies the 4:3:2 nested sphere ratio using commercial 304 stainless steel hemispheres welded at the equator, with closed outer poles and perpendicular tangential ports driving helical boundary-layer shear.',
    garryRyanNotes:
      'In Garry Ryan’s inside-out boilermaker sequence, the 4" outer hemispheres are the final shell fitted over the pre-welded and leak-tested 3"/2" core assembly, using the outer bridge sleeve and port stubs to self-center the 4"–3" annulus before TIG-welding the equator.',
    makerBuildIdeas:
      'Use a pair of simple plywood or 3D-printed saddle cradles lined with copper chill tape so thin commercial 304 hemispheres stay concentric and resist heat distortion during equator tacking.',
    sourcingIdeas: [
      'Avoid ultra-thin (0.4–0.6 mm) decorative garden gazing balls unless using pulsed micro-TIG; source 16 ga (1.5 mm) or 11 ga (3.0 mm) 304 SS industrial tank heads / pipe caps from stamping suppliers (e.g., Sharpe Products, McMaster-Carr).',
      'Commercial 4" hollow 304 stainless industrial float spheres (for steam traps / tank level gauges) offer thicker, uniform weldable walls at ~$12–$20 each.',
    ],
    fabricationTips: [
      'Back thin gazing-sphere seams with a curved copper or aluminum chill block or purge with argon to prevent burn-through and sugaring inside the sealed cavity.',
      'Print wrap-around paper coping templates at 51.84° / tangential offsets and cut port holes with a carbide-tipped hole saw + cutting oil before closing the equator.',
    ],
    alternativeMaterials: [
      '316L stainless steel for higher chloride/exhaust condensate corrosion resistance.',
      'Clear PETG-CF or SLA resin split-equator shells with sanitary tri-clamp ferrules for zero-weld cold-flow visualization.',
    ],
  },

  vajra_mid_3: {
    id: 'vajra_mid_3',
    name: '3-Inch Middle 304 Partition Shell',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: '304 Stainless Steel (Satin/Mirror Hemisphere, ~2.1 mm wall)',
    dimensions: '3.00" OD × 2.83" ID · 0.085" wall gauge',
    functionalPurpose:
      'Hermetically separates the outer 4"–3" intake/plasmoid stream from the inner 3"–2" exhaust/reforming stream while transferring acoustic and thermal harmonics across its thin wall.',
    bendallNotes:
      'Represents the middle "3" harmonic of the 4:3:2 resonant nested sphere architecture. Must remain completely sealed from the outer 4" cavity so the two opposing vortex streams exchange energy thermally/acoustically without fluid mixing.',
    garryRyanNotes:
      'Garry Ryan assembles and TIG-welds the 3" shell around the pinned 2" inner shell FIRST, welding on the inner bridge tube and inner tangential port stubs so the entire 3"–2" inner circuit can be soap-bubble pressure-tested before the 4" shell ever goes on.',
    makerBuildIdeas:
      'Keep a dedicated pressurized-air rubber test bung handy to check every 3" seam under soapy water at 5–10 psi—catching a pinhole here saves cutting open a finished 4" outer shell later.',
    sourcingIdeas: [
      'Source 3" OD × 16 ga 304 SS hemispheres from metal spinning houses or cut two 3" 304 stainless soup ladles / spherical ice-mold halves trimmed flat on a belt sander.',
      'Industrial 3" hollow 304 SS float balls (300–400 psi rated) cut cleanly along the equator with a thin 0.8 mm cutoff wheel in a simple 3D-printed miter cradle.',
    ],
    fabricationTips: [
      'Always pressure-test the 3" assembly to 5–10 psi under soapy water before welding the 4" shell over it—once enclosed, an internal leak cannot be reached.',
      'De-burr and chamfer the inner bridge penetration hole so the inner bridge tube seats cleanly for a full-penetration fillet weld.',
    ],
    alternativeMaterials: [
      'Spun C110 copper hemispheres for thermal-conductivity experiments (requires silver-brazing instead of TIG).',
      '1.6 mm wall 304 dairy-grade reducer cones welded into an approximate octahedron/sphere for budget sheet-metal fabrication.',
    ],
  },

  vajra_inner_2: {
    id: 'vajra_inner_2',
    name: '2-Inch Hollow Inner Core Shell',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: '304 Stainless Steel Hollow Sphere (~1.9 mm wall)',
    dimensions: '2.00" OD × 1.85" ID · Hollow resonant cavity',
    functionalPurpose:
      'Forms the central displacement boundary of the 3"–2" inner vortex annulus, forcing incoming flow to accelerate around an annular spherical path rather than short-circuiting straight across.',
    bendallNotes:
      'Completes the 4:3:2 harmonic geometry. Contrary to solid-bar interpretations, practical builds use a hollow 2" 304 sphere shell, saving mass, cost, and thermal lag while creating an enclosed inner acoustic cavity.',
    garryRyanNotes:
      'Garry Ryan uses a lightweight hollow 2" 304 stainless sphere (NOT solid steel), welded closed first and suspended concentrically inside the 3" shell by two opposing 304 stainless steel rods.',
    makerBuildIdeas:
      'Skip welding tiny 2" hemispheres altogether by buying pre-welded 2" hollow 304 stainless float balls or handrail finial spheres for ~$5 each—they arrive round, sealed, and ready for two-rod pinning.',
    sourcingIdeas: [
      'Off-the-shelf 2" (50.8 mm) hollow 304 SS handrail finial spheres or industrial float balls cost $4–$8 and arrive pre-welded and polished—zero equator welding required.',
      '2" 304 SS decorative bearing/gazing balls (1.0–1.5 mm wall) sold in hardware and architectural railing catalogs.',
    ],
    fabricationTips: [
      'Because the 2" sphere is pre-sealed, drill tiny ~3 mm dimples (not through-holes if keeping it hermetically sealed, or through-drill if using a single continuous cross-rod) to index the two support rods.',
      'Spin-check concentricity inside one 3" hemisphere with clay or cardboard shims before tacking the rods.',
    ],
    alternativeMaterials: [
      'Hollow 2" spun brass or copper float ball (from vintage toilet/boiler float valves) for non-stainless test rigs.',
      'Hollow 3D-printed stainless-filled or ceramic-filled test core for ambient-temperature flow bench prototyping.',
    ],
  },

  vajra_support_rods: {
    id: 'vajra_support_rods',
    name: 'Two-Rod Concentric Core Suspension',
    deviceId: 'vajra432',
    classification: 'interpreted',
    materialSpec: '304 / ER308L Stainless Steel Rod (3.2 mm / 1/8")',
    dimensions: '2× opposing rods · Ø 0.125" × 0.42" span',
    functionalPurpose:
      'Mechanically suspends the hollow 2" sphere concentrically inside the 3" middle shell with minimal flow obstruction in the 3"–2" annular gap.',
    bendallNotes:
      'Physical builds use just two simple rods attaching the hollow 2" sphere to the surrounding 3" shell—maximizing simplicity and minimizing parasitic drag compared to multi-vane internal spiders.',
    garryRyanNotes:
      'Garry Ryan suspends the hollow 2" core using just two opposing 304 stainless rods anchored between the 2" outer wall and 3" inner wall during the puzzle-like inner assembly.',
    makerBuildIdeas:
      'Instead of attempting tricky blind internal TIG welds inside a tight 3" curve, drill two opposing 3.5 mm pilot holes at the 3" poles, seat the rods against the 2" ball in a V-block jig, and plug/rosette-weld cleanly from the OUTSIDE.',
    sourcingIdeas: [
      'Use straight lengths of 1/8" (3.2 mm) or 3/32" (2.4 mm) ER308L TIG filler rod already sitting on any stainless welding bench—virtually zero extra material cost.',
      '3 mm 304 stainless dowel pins or cut bicycle/motorcycle stainless spokes for tight slip-fit alignment.',
    ],
    fabricationTips: [
      'External Rosette-Weld Hack: Drill 3.5 mm holes at the north/south poles of the 3" shell, insert the rods until they touch the 2" sphere seated on a spacer shim, tack from the outside, and TIG-rosette weld flush.',
      'Alternatively, drill straight through both sides of the 3" shell and 2" shell along one axis, pass a single 3.2 mm rod straight through, and weld both outer ends—guaranteed concentricity with only 2 external welds.',
    ],
    alternativeMaterials: [
      '316L TIG filler wire or 304 threaded M3 studding for bolted prototype tear-down shells.',
    ],
  },

  vajra_bridge_concentric: {
    id: 'vajra_bridge_concentric',
    name: 'Concentric Tube-in-Tube 304 Bridge',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: '304 Seamless/Welded Sanitary Stainless Tubing',
    dimensions: 'Outer sleeve: 1.32" OD · Inner tube: 0.72" OD (isolated annulus)',
    functionalPurpose:
      'Connects the twin triple-nested spheres while keeping the outer 4"–3" stream and inner 3"–2" stream physically isolated—and acts as the primary structural spine anchoring the 3" shells inside the 4" shells.',
    bendallNotes:
      'Bendall emphasizes clean welded tube-inside-a-tube concentric 304 stainless piping without bolted flange stacks, copper coils, or unnecessary fittings—allowing the two counter-flowing helical streams to interact across the shared inner tube wall.',
    garryRyanNotes:
      'Garry Ryan cuts and copes standard telescoping 304 tubing cleanly so the inner tube bridges the 3" spheres first, then slides the outer bridge sleeve over it to locate the 4" outer shells at exact center-to-center spacing.',
    makerBuildIdeas:
      'Use standard off-the-shelf 3/4" inside 1.25" or 1.5" dairy sanitary tubing with three temporary copper shims spaced 120° apart during tacking—zero lathe boring required to hold an even annular gap.',
    sourcingIdeas: [
      'Standard off-the-shelf 304 dairy/brewery sanitary tubing (3/4" OD × 0.065" wall inside 1.25" or 1.5" OD × 0.065" wall) provides clean telescoping clearances with no lathe turning.',
      'Exhaust-grade 304 mandrel tubing (e.g., 19 mm inside 32–38 mm) from automotive exhaust suppliers is far cheaper than aerospace seamless stock.',
    ],
    fabricationTips: [
      'Weld three tiny spacer nubs (120° apart) onto the inner tube ends or use temporary copper shims while tacking the outer sleeve to keep the concentric annular gap perfectly even.',
      'Use a hole-saw arbor guide welded to scrap flat bar to bore dead-center axial holes in the 3" and 4" hemispheres.',
    ],
    alternativeMaterials: [
      'Schedule 10S 304 pipe (3/8" inside 1") for heavy-duty high-vibration diesel engine retrofits.',
    ],
  },

  vajra_ports_outer: {
    id: 'vajra_ports_outer',
    name: 'Outer (4"–3") End-Shifted Tangential Ports',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: 'Brushed 304 Stainless Tubing (coped at 51.84° / tangential saddle)',
    dimensions: '0.42" OD × 0.31" ID · End-shifted ±3.95" along X · Radial offset ±1.35" Z',
    functionalPurpose:
      'Injects and extracts the Blue vortex stream near the outer ends of each sphere, perpendicular to the longitudinal axis and tangent to the 4"–3" annular wall—maximizing helical wrap-around flow length across the chamber and bridge.',
    bendallNotes:
      'Explicitly requires four perpendicular, radially offset tangential ports (1 inlet, 1 outlet per layer) positioned near the outer ends of the spheres so fluid wraps multiple revolutions around the curved gazing-sphere walls before entering the concentric bridge.',
    garryRyanNotes:
      'Coping tubes tangentially into a curved sphere at Bendall’s 51.84° harmonic angle is one of the trickier boilermaker fit-ups; Garry uses tight-fit hole-saw saddles and clean TIG fillets so internal edges stay smooth.',
    makerBuildIdeas:
      'Print a 1:1 cylindrical coping wrapper (TubeMiter template) matched to the exact end-cap axial offset and radial offset so you can grind a snug 51.84° saddle profile with an angle or die grinder in minutes.',
    sourcingIdeas: [
      '1/2" (12.7 mm) or 3/8" (9.5 mm) 304 instrumentation tubing sold in 3-foot hobby/hydraulic lengths.',
      'Standard 304 welded AN/NPT weld-on bungs or sanitary hose-barb stubs trimmed to length for fast flexible-hose coupling.',
    ],
    fabricationTips: [
      'Print a 1:1 cylindrical coping wrapper (TubeMiter / paper template) for the exact sphere radius + radial offset so you can grind the saddle profile in 5 minutes with a die grinder.',
      'Leave the port stub protruding 1–2 mm flush inside the 4" wall and polish the inner burr with a rotary carbide burr before final closure.',
    ],
    alternativeMaterials: [
      'Silicone-coupled 304 push-lock stubs for modular test benches.',
    ],
  },

  vajra_ports_inner: {
    id: 'vajra_ports_inner',
    name: 'Inner (3"–2") End-Shifted Pass-Through Ports',
    deviceId: 'vajra432',
    classification: 'interpreted',
    materialSpec: '304 Stainless Tubing with Sealed Outer-Shell Collar',
    dimensions: '0.35" OD × 0.25" ID · End-shifted ±3.62" along X · Radial offset ±0.96" Z',
    functionalPurpose:
      'Routes the counter-rotating Orange stream tangentially into and out of the outer ends of the 3"–2" inner cavity while passing sealed across the 4"–3" outer annulus without cross-contamination.',
    bendallNotes:
      'To keep the 4"–3" and 3"–2" streams completely isolated while still maximizing helical wrap length in the inner sphere and high-vorticity bridge travel, the inner ports pass cleanly through the outer 4" wall via sealed penetration welds.',
    garryRyanNotes:
      'Garry welds the inner tangential tubes directly onto the 3" sphere BEFORE fitting the 4" shell, then fits the 4" hemisphere over those protruding tubes and welds the exterior pass-through seam—turning the ports into additional concentric bracing.',
    makerBuildIdeas:
      'Slot one edge of the 4" hemisphere into a U-notch rather than a closed round hole so the 4" half slides sideways over already-welded inner port tubes, then close the notch with a laser-cut 304 saddle washer.',
    sourcingIdeas: [
      '3/8" OD × 0.049" wall 304 stainless hydraulic/fuel line tubing—bends easily, welds cleanly, and fits standard Swagelok/compression or silicone couplers.',
    ],
    fabricationTips: [
      'Slot one half of the 4" hemisphere equator edge into a U-notch rather than a closed round hole so the 4" half slides sideways over the already-welded inner port tubes!',
      'Fill the U-notch around the port tube with a small laser-cut 304 saddle washer during final TIG welding.',
    ],
    alternativeMaterials: [
      'Brazed brass compression bulkhead pass-throughs for non-welded prototype mockups.',
    ],
  },

  vajra_weld_seams: {
    id: 'vajra_weld_seams',
    name: 'TIG Equator Weld Beads & 51.84° Coping Guides',
    deviceId: 'vajra432',
    classification: 'explicit',
    materialSpec: 'ER308L TIG Autogenous / Filler Weld Bead',
    dimensions: 'Continuous equator seam + 51.84° port transition collars',
    functionalPurpose:
      'Hermetically joins the commercial gazing hemispheres and port transitions while maintaining continuous interior wall smoothness for unimpeded vortex boundary layers.',
    bendallNotes:
      'Bendall highlights the 51.84° harmonic angle (Great Pyramid slope / Phi-linked geometry) in tube-to-sphere transition collars and vortex cone inclinations.',
    garryRyanNotes:
      'Garry Ryan uses purge-backed pulse TIG welding with ER308L rod to keep internal weld penetration smooth ("no icicles inside") so boundary-layer vortex spin isn’t tripped.',
    makerBuildIdeas:
      'If you do not have a dual argon flowmeter, seal ports with painter’s tape + a tiny pinhole vent and trickle argon from a single Y-splitter, or use Solar Flux Type B paste on the inside seam to stop sugaring.',
    sourcingIdeas: [
      '1 lb tube of 1/16" (1.6 mm) ER308L stainless TIG rod + argon back-purge Y-splitter from any local welding supply.',
    ],
    fabricationTips: [
      'Use solar/ceramic welding purge tape or simple aluminum foil + argon trickle inside the chamber for glassy, non-sugared internal weld roots.',
      'Autogenous (no-filler) tack welds every 30° around the equator prevent distortion before running the continuous weld pass.',
    ],
    alternativeMaterials: [
      'High-temp silver brazing (56% silver + white flux) using a MAPP/oxygen torch if a TIG welder is unavailable.',
    ],
  },

  bubbler_acrylic_vessel: {
    id: 'bubbler_acrylic_vessel',
    name: 'Clear Cast Acrylic (PMMA) Cavitation Cylinder',
    deviceId: 'bubbler',
    classification: 'explicit',
    materialSpec: 'Clear Cast PMMA Acrylic (IOR 1.49, 6.35 mm / 1/4" wall)',
    dimensions: '6.00" OD × 5.50" ID × 8.50" height',
    functionalPurpose:
      'Contains the permanent ambient water cavitation column and allows real-time optical inspection of sparger micro-bubbles, symmetric pulse collapse, meniscus oscillation, and baffle mist capture.',
    bendallNotes:
      'Critically, Bendall’s bubbler contains NO pre-heating coils or heat-exchange jackets—the ambient water body is a permanent cavitation medium that must be retained rather than boiled away.',
    makerBuildIdeas:
      'Construct as a simple straight cast acrylic cylinder clamped between top and bottom stainless end caps with elastomer O-rings and external tie-rods—zero complex acrylic threading or solvent-welded pressure domes.',
    sourcingIdeas: [
      'Off-the-shelf 6" OD × 1/4" wall clear cast acrylic tubing from TAP Plastics, ePlastics, or McMaster-Carr (~$25–$40 per foot).',
      'Ultra-budget maker hack: Repurpose a clear 10" whole-house water filter sump housing or a 4"–6" brewery tri-clamp borosilicate sight glass!',
    ],
    fabricationTips: [
      'Always choose CAST acrylic over extruded acrylic—extruded tube crazes and spider-cracks rapidly when exposed to vibration, O-ring compression, or engine-bay fumes.',
      'Face-sand both tube ends flat on 220/400-grit sandpaper taped to a glass pane so the O-rings seal evenly around 360°.',
    ],
    alternativeMaterials: [
      'Borosilicate glass cylinder (Pyrex / lab glass / French press carafe) for high-temperature or UV-exposed test runs.',
      'Clear polycarbonate (Lexan) tube for extreme impact resistance against vacuum implosion.',
    ],
  },

  bubbler_end_caps: {
    id: 'bubbler_end_caps',
    name: '304 Stainless End Caps & Tie-Rod Compression',
    deviceId: 'bubbler',
    classification: 'interpreted',
    materialSpec: '304 Stainless Steel Laser-Cut Plates + Viton O-Rings + M8 Tie-Rods',
    dimensions: 'Ø 7.10" plates · 0.25" plate thickness · 4× 304 tie-rods',
    functionalPurpose:
      'Clamps the cast acrylic cylinder hermetically under alternating engine vacuum and pressure pulses without adhesive bonding, allowing fast disassembly for water or baffle inspection.',
    bendallNotes:
      'End caps provide sealed structural bulkheads for the central UV dip-tube entry, the conditioned outlet port above the baffles, and the lower drain/water retention base.',
    makerBuildIdeas:
      'Flat laser-cut 304 plates with 4 corner tie-rods eliminate expensive CNC lathe threading or flange castings while withstanding full engine manifold vacuum.',
    sourcingIdeas: [
      'SendCutSend / OshCut laser-cut 6 mm (1/4") 304 SS square or octagonal plates (~$15 each) + 4× 304 M8 all-thread rods and acorn nuts from a hardware store.',
      'Alternative zero-machining O-ring groove: stack two thin 2 mm laser-cut 304 rings on top of the main plate so the gap between rings forms an instant captive O-ring channel!',
    ],
    fabricationTips: [
      'Use Viton (FKM) or PTFE-encapsulated silicone O-rings rather than standard Buna-N if ozone or ionized vapor contacts the seal.',
      'Torque the 4 tie-rods in a crisp star pattern just until the O-ring flattens ~20%—over-tightening can crack acrylic.',
    ],
    alternativeMaterials: [
      '6061-T6 anodized aluminum plates (even cheaper to cut/drill) for non-corrosive ambient benchtop testing.',
      'Off-the-shelf 6" sanitary tri-clamp end caps if building directly around a 6" brewery sight-glass cylinder.',
    ],
  },

  bubbler_uv_chamber: {
    id: 'bubbler_uv_chamber',
    name: 'Top-Mounted 304 SS / PTFE UV Air-Ionization Chamber',
    deviceId: 'bubbler',
    classification: 'interpreted',
    materialSpec: 'Electropolished 304 SS Sanitary Spool + PTFE UV-Inert Seals + 254 nm UV-C Lamp',
    dimensions: '2.00" OD × 3.80" vertical spool · Top-mounted coaxial feed',
    functionalPurpose:
      'Pre-ionizes and photon-conditions incoming air via 254 nm UV-C radiation directly above the central dip-tube before the air enters the water column.',
    bendallNotes:
      'Bendall’s schematics incorporate ultraviolet light pre-conditioning of incoming air/vapor to mimic photonic cavitation emissions and assist charge separation prior to bubble formation.',
    makerBuildIdeas:
      'Construct top-mounted from off-the-shelf 304 stainless steel sanitary spool stock and PTFE bulkhead seals rather than fragile quartz housings or UV-degrading plastics—making it rugged, cheap, and internally UV-reflective.',
    sourcingIdeas: [
      'Off-the-shelf 2" 304 stainless steel sanitary tri-clamp spool (6" length, ~$18 from homebrew/distilling suppliers) + PTFE tri-clamp gaskets ($2).',
      'Inexpensive 12V DC or AC pond/aquarium UV-C germicidal replacement lamp (5W–11W, 254 nm) mounted via a drilled PTFE compression gland.',
    ],
    fabricationTips: [
      'Polish the interior bore of the 304 spool (or line with aluminum/stainless foil) so UV-C photons reflect multiple times across the incoming air stream before diving down the dip-tube.',
      'NEVER use acrylic, PVC, or nylon inside the UV-C zone—shortwave 254 nm UV rapidly embrittles standard plastics; stick strictly to 304 SS, PTFE, Viton, or ceramics.',
    ],
    alternativeMaterials: [
      'PTFE (Teflon) thick-walled tube sleeve or anodized aluminum housing for ultra-lightweight prototypes.',
      'Optional fused-quartz inner lamp sleeve ONLY around the bulb filament if protecting electrical pins from high humidity.',
    ],
  },

  bubbler_dip_tube: {
    id: 'bubbler_dip_tube',
    name: 'Central 304 Stainless Dip-Tube',
    deviceId: 'bubbler',
    classification: 'explicit',
    materialSpec: '304 Stainless Tubing (1/2" OD × 0.065" wall)',
    dimensions: '0.50" OD · Runs from top UV chamber through baffles to bottom sparger',
    functionalPurpose:
      'Delivers UV-ionized air straight from the top conditioning spool down to the submerged sparger while simultaneously acting as the central alignment spine for the stacked coalescence baffles.',
    bendallNotes:
      'Carries the pre-conditioned gas stream cleanly beneath the water meniscus without short-circuiting into the upper outlet vapor space.',
    makerBuildIdeas:
      'Run standard 1/2" 304 tubing through a Swagelok-style bulkhead union on the top plate so the dip-tube serves simultaneously as gas conduit and mechanical hanger for the baffle discs.',
    sourcingIdeas: [
      'Standard 1/2" OD × 16 ga 304 SS brewery racking cane / sanitary tube or stainless refrigerator/hydraulic line.',
      'Use a standard 1/2" 304 Swagelok-style bulkhead union on the top plate for solderless, adjustable dip-tube depth.',
    ],
    fabricationTips: [
      'Slip stainless shaft collars or short cut lengths of 5/8" ID tubing over the dip-tube as rapid spacers between each coalescence baffle disc.',
    ],
    alternativeMaterials: [
      '316L stainless tubing or rigid PTFE tubing (inside the tank) for chemical-dosing experiments.',
    ],
  },

  bubbler_sparger: {
    id: 'bubbler_sparger',
    name: 'Submerged Perforated / Sintered Sparger',
    deviceId: 'bubbler',
    classification: 'explicit',
    materialSpec: '304 Stainless Micro-Drilled Ring / Sintered 316L Diffuser',
    dimensions: '2.30" ring diameter · 24× radial micro-orifices (0.8–1.2 mm)',
    functionalPurpose:
      'Breaks the incoming UV-ionized gas stream into thousands of uniform micro-bubbles at the base of the ambient water column so engine vacuum pulses trigger symmetric cavitation collapse.',
    bendallNotes:
      'Uniform micro-bubble dispersion is critical for achieving symmetric bubble collapse ("star-in-a-jar" sonoluminescence / micro-plasmoid formation) rather than large slugging bubbles.',
    makerBuildIdeas:
      'Either cap a 304 tube/tee and drill fine radial holes with a 1 mm cobalt bit, or thread an off-the-shelf sintered 316L stainless homebrew diffusion stone directly onto the dip-tube tip.',
    sourcingIdeas: [
      'Off-the-shelf 0.5-micron or 2-micron sintered 316L stainless homebrew oxygenation / carbonation diffusion stone with 1/2" NPT or barb ($8–$14).',
      'DIY Zero-Cost Sparger: Cap a short 304 stainless tee or coil of 3/8" tube and drill 20–30 radial holes with a 1.0 mm cobalt drill bit.',
    ],
    fabricationTips: [
      'If drilling your own tube sparger, center-punch every hole lightly first and drill at low RPM with cutting fluid—304 work-hardens instantly if a dull bit rubs.',
      'Orient exit holes slightly downward or horizontally so rising bubbles travel the maximum residence path through the water.',
    ],
    alternativeMaterials: [
      'Porous sintered bronze air muffler (ultra-cheap pneumatic silencer, ~$3) for ambient cold-water bench testing.',
      'Ceramic fine-pore aquarium air diffuser disc for non-pressurized demonstration units.',
    ],
  },

  bubbler_baffles: {
    id: 'bubbler_baffles',
    name: 'Stacked 304 Droplet-Retention / Coalescence Baffles',
    deviceId: 'bubbler',
    classification: 'explicit',
    materialSpec: '304 Stainless Perforated / Slotted Discs (1.5 mm gauge)',
    dimensions: '3× stacked discs · Ø 4.70" · Staggered radial slots',
    functionalPurpose:
      'Forces rising conditioned gas/plasmoid vapor through tortuous staggered paths above the water meniscus to coalesce liquid droplets and return water back down into the tank—retaining the permanent water medium.',
    bendallNotes:
      'Essential because the ambient water body is a permanent cavitation medium that must NOT be sucked into the engine or boiled off; baffles trap liquid carry-over while passing fine ionized mist/gas.',
    makerBuildIdeas:
      'Stack 3 laser-cut or hole-punched 304 stainless discs along the upper dip-tube separated by cut sleeve spacers, rotating each disc by 60°–120° so rising mist takes a staggered coalescence path.',
    sourcingIdeas: [
      'Laser-cut 3× 1.5 mm 304 SS slotted discs (~$4 each from SendCutSend) OR repurpose 304 stainless kitchen sink strainers / perforated French-press filter plates!',
      'Stuff a 1" layer of pure 304 stainless knitted mesh (copper/stainless scrubber pad—verify 100% 304 SS, not galvanized!) between two perforated retaining discs for industrial-grade mist elimination.',
    ],
    fabricationTips: [
      'Rotate each stacked baffle disc by 60°–120° relative to the one below it so rising droplets never have a straight line-of-sight to the top outlet port.',
      'Leave a 2–3 mm perimeter drip gap or small drain notches near the acrylic wall so coalesced water runs quietly back down into the reservoir.',
    ],
    alternativeMaterials: [
      'PTFE or polypropylene perforated baffle plates for ultra-lightweight cold-water test columns.',
    ],
  },

  bubbler_water_column: {
    id: 'bubbler_water_column',
    name: 'Ambient Cavitation Water Medium & Meniscus',
    deviceId: 'bubbler',
    classification: 'explicit',
    materialSpec: 'Distilled / Conditioned H₂O at Ambient Temperature',
    dimensions: 'Ø 5.42" × 4.65" column height (animated pulse meniscus)',
    functionalPurpose:
      'Acts as the permanent acoustic/hydrodynamic cavitation medium where reciprocating engine vacuum/pressure shockwaves drive symmetric micro-bubble collapse and structured micro-plasmoid generation.',
    bendallNotes:
      'Strictly NOT heated or boiled—ambient water is retained indefinitely via the coalescence baffles as a cavitation reaction medium.',
    makerBuildIdeas:
      'Maintain water level roughly 55–65% of cylinder height so at least 2.5–3 inches of disengagement headspace remain below the lower coalescence baffle during high-vacuum surges.',
    sourcingIdeas: [
      'Standard distilled or deionized water (prevents mineral scaling on the sparger pores and acrylic walls); optional trace electrolyte tests only where noted in controlled experiments.',
    ],
    fabricationTips: [
      'Include a simple 1/4" NPT bottom brass/stainless petcock or plug in the lower end plate for effortless water level adjustment and draining.',
    ],
    alternativeMaterials: [
      'Heavy water / mineral-conditioned blends in closed-loop laboratory diagnostics (always keeping acrylic compatibility in mind).',
    ],
  },

  bubbler_copper_bus: {
    id: 'bubbler_copper_bus',
    name: 'Auxiliary Copper Grounding / Charge Bus (Optional Layer)',
    deviceId: 'bubbler',
    classification: 'extrapolated',
    materialSpec: 'C110 Electrolytic Tough-Pitch Copper Strip / Rod',
    dimensions: '0.25" × 0.08" bus bar linking end caps',
    functionalPurpose:
      'Optional external charge-equalization / grounding bridge across the electrically insulating acrylic cylinder to drain static build-up or allow instrumentation voltage/current probing.',
    bendallNotes:
      'Note: Simple welded 304 stainless setups do NOT require decorative copper coils; this optional bus bar represents an auxiliary instrumentation/grounding bridge that can be unchecked and hidden.',
    makerBuildIdeas:
      'Whenever running an insulating acrylic cylinder between metal end caps, tying the top and bottom 304 plates together under existing tie-rod nuts with a single copper strap prevents stray electrostatic build-up.',
    sourcingIdeas: [
      'Flatten a short scrap of 1/4" copper refrigerator tubing in a bench vise or use standard 10 AWG solid bare copper house-grounding wire crimped with ring terminals.',
    ],
    fabricationTips: [
      'Bolt ring terminals directly under two of the existing stainless tie-rod nuts—zero extra holes needed.',
    ],
    alternativeMaterials: [
      'Braided tinned-copper ground strap (automotive engine block ground strap, ~$4) for vibration isolation.',
    ],
  },

  dual_cone_shells: {
    id: 'dual_cone_shells',
    name: 'Implosive Dual-Cone 304 Vortex Shells (Optional Device)',
    deviceId: 'dualCone',
    classification: 'extrapolated',
    materialSpec: '304 Stainless Steel Concentric Reducer Cones (51.84° half-angle)',
    dimensions: '4.20" base OD × 1.10" throat OD × 6.80" total span',
    functionalPurpose:
      'Synthesized extrapolation exploring Bendall’s implosive vortex geometry: twin opposing cones force tangential gas/plasma streams to accelerate inward toward a high-shear central implosion waist.',
    bendallNotes:
      'Derived from Bendall’s discussion of implosive vortex turbines and Great Pyramid 51.84° angular convergence principles.',
    makerBuildIdeas:
      'Rather than hand-rolling custom conical sheet metal, weld two off-the-shelf 4"×1.5" 304 sanitary concentric reducers base-to-base (or neck-to-neck depending on convergent vs. divergent mode).',
    sourcingIdeas: [
      'Off-the-shelf 4" × 1.5" 304 stainless sanitary concentric reducers (~$18–$28 each from brewery/dairy pipe suppliers) welded together!',
      'Stainless steel laboratory or heavy-gauge kitchen funnels trimmed cleanly on a band saw.',
    ],
    fabricationTips: [
      'Tack-weld two concentric reducers base-to-base on a flat welding table with 4 opposing clamps before running a low-amp pulsed TIG seam.',
    ],
    alternativeMaterials: [
      'Spun copper funnels for high-conductivity thermal experiments or SLA/PETG 3D prints for cold-flow smoke/particle visualization.',
    ],
  },

  dual_cone_throat: {
    id: 'dual_cone_throat',
    name: 'Central Implosion Throat & Tangential Ring',
    deviceId: 'dualCone',
    classification: 'extrapolated',
    materialSpec: 'Brushed 304 Stainless Central Collar & Tangential Ports',
    dimensions: '1.15" throat OD · Dual tangential injection stubs',
    functionalPurpose:
      'Creates a low-pressure venturi/implosion focal zone where opposing helical Blue and Orange streams shear past one another.',
    bendallNotes:
      'Extrapolated coupling node exploring counter-rotating vortex shear at the narrowest harmonic constriction.',
    makerBuildIdeas:
      'Join the two reducer cones via a short 1.5" 304 stainless ferrule sleeve so tangential ports have a flat cylindrical landing to cope onto rather than cutting directly onto a taper.',
    sourcingIdeas: [
      '1.5" 304 sanitary tri-clamp ferrule + short spool section (~$10), making the throat modular and inspectable.',
    ],
    fabricationTips: [
      'Coping tangential ports into a straight cylindrical throat collar is 3× faster than coping directly onto a tapered cone.',
    ],
    alternativeMaterials: [
      'Machined PTFE throat insert for electrically isolating the left and right cone halves.',
    ],
  },

  toroid_ring: {
    id: 'toroid_ring',
    name: 'Toroidal 304 Plasmoid Collector Ring (Optional Device)',
    deviceId: 'toroid',
    classification: 'extrapolated',
    materialSpec: 'Mirror/Brushed 304 Stainless Mandrel-Bent Torus (1.20" tube)',
    dimensions: '4.80" major diameter × 1.20" minor tube OD',
    functionalPurpose:
      'Synthesized extrapolation providing a closed-loop toroidal resonator where circulating plasmoid wisps maintain continuous azimuthal momentum around a self-reinforcing ring.',
    bendallNotes:
      'Inspired by Bendall’s Plasmoid Unification Model (PUM) toroidal geometry—representing the natural self-organizing shape of ball lightning / Exotic Vacuum Objects.',
    makerBuildIdeas:
      'Never hydroform a torus from scratch—simply buy four standard 90° mandrel-bent 304 sanitary/exhaust elbows of identical centerline radius and TIG-weld them into a seamless ring.',
    sourcingIdeas: [
      '4× 1.25" or 1.5" 304 stainless 90° mandrel-bent exhaust/sanitary elbows (~$10–$14 each) = instant precision torus for ~$50!',
      'For mini benchtop scales: two 180° 304 U-bends welded at the two straight cuts.',
    ],
    fabricationTips: [
      'Use an external 3D-printed or plywood circular jig ring to keep all four 90° elbows coplanar while tacking.',
      'Purge inside the ring via one tangential port before sealing the final butt weld.',
    ],
    alternativeMaterials: [
      '4× 90° copper sweat elbows (plumbing aisle, ~$4 each) soldered into a torus in 15 minutes for cold-flow or magnetic-induction prototyping.',
    ],
  },

  toroid_collector_ports: {
    id: 'toroid_collector_ports',
    name: 'Tangential Injection & Extraction Ports',
    deviceId: 'toroid',
    classification: 'extrapolated',
    materialSpec: 'Brushed 304 Stainless Tangential Stubs',
    dimensions: '0.42" OD × 4× radial/tangential ports',
    functionalPurpose:
      'Feeds conditioned plasmoid/vapor flow tangentially into the toroidal circulation path and extracts stabilized output streams.',
    bendallNotes:
      'Applies the same perpendicular tangential entry principle from the 432 Vajra to a closed toroidal cavity.',
    makerBuildIdeas:
      'Cope and weld tangential stubs directly onto the outer tangent of the 90° elbows BEFORE welding the four elbows into a closed ring so internal burrs are easy to reach.',
    sourcingIdeas: [
      'Standard 1/2" 304 tube stubs or weld-on hose barbs.',
    ],
    fabricationTips: [
      'Drill and weld the tangential ports into the individual 90° elbows BEFORE closing the torus so you can deburr the inside freely.',
    ],
    alternativeMaterials: [
      'Copper tee fittings spliced between 90° copper elbows for solder-together prototypes.',
    ],
  },

  system_manifold: {
    id: 'system_manifold',
    name: 'Coupled Engine Pulse & Transfer Manifold',
    deviceId: 'system',
    classification: 'interpreted',
    materialSpec: '304 Stainless Transfer Tubing & High-Temp Silicone Couplers',
    dimensions: '0.50" OD transfer lines linking UV -> Bubbler -> 432 Vajra',
    functionalPurpose:
      'Synchronizes reciprocating engine intake vacuum and exhaust pressure pulses between the UV-conditioned Cavitation Bubbler and the twin-chamber 432 Stubby Vajra Core.',
    bendallNotes:
      'In the full Thunderstorm Generator retrofit, engine intake vacuum pulls ionized mist through the bubbler while exhaust thermal/pressure pulses drive the inner Vajra loop before returning reformed gas to the engine intake.',
    garryRyanNotes:
      'Garry Ryan keeps transfer runs between the bubbler and Vajra short and clean with stainless tubing and flexible couplings where needed so engine vibration does not fatigue rigid welds.',
    makerBuildIdeas:
      'Pair 1/2" & 3/4" 304 stainless tubing with 4-ply fluorosilicone automotive intercooler couplers and T-bolt clamps for quick modular bench swaps and thermal/vibration isolation.',
    sourcingIdeas: [
      '1/2" & 3/4" 304 stainless tubing + 4-ply fluorosilicone automotive intercooler couplers and T-bolt clamps (~$5 each).',
      'Flexible corrugated 304 stainless gas/exhaust flex bellows for isolating generator engine vibration.',
    ],
    fabricationTips: [
      'Keep transfer lines between the Bubbler outlet and Vajra inlet as short and gentle-radiused as possible to preserve acoustic pulse sharpness and prevent mist condensation in low spots.',
      'Slope horizontal runs slightly back toward the Bubbler or install a low-point condensate trap.',
    ],
    alternativeMaterials: [
      'PTFE-lined stainless braided AN hose for rapid reconfiguration between different test engines.',
    ],
  },
};

export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  // EXPLICIT
  {
    id: 'exp-432-ratios',
    title: '4:3:2 Triple-Nested Hollow Sphere Harmonic Geometry',
    category: 'explicit',
    summary:
      'Twin spherical chambers built from commercial 304 stainless steel hemispheres (4" outer, 3" middle, 2" hollow inner shell) welded at their equators.',
    details: [
      'Outer poles remain closed; no axial end-caps pierce the 4" outer shell.',
      'The innermost 2" sphere is a hollow shell (not solid stock), held concentrically inside the 3" shell by two opposing 304 SS support rods.',
      'Realistic weldable wall gauges (~1.5–2.5 mm / 16–13 ga) ensure clean TIG penetration without burn-through.',
    ],
    deviceRefs: ['432 Stubby Vajra', 'Coupled System'],
  },
  {
    id: 'exp-concentric-ports',
    title: 'Concentric Tube-in-Tube Bridge & 4 Perpendicular Tangential Ports',
    category: 'explicit',
    summary:
      'Twin chambers join via a clean concentric tube-inside-a-tube 304 stainless bridge keeping the 4"–3" and 3"–2" flow layers strictly isolated.',
    details: [
      'Four ports (1 inlet & 1 outlet for 4"–3"; 1 inlet & 1 outlet for 3"–2") sit perpendicular to the longitudinal axis, shifted toward the outer ends of their respective spheres and radially offset in Z.',
      'End-shifted tangential entry sweeps streams across multiple full helical revolutions around the sphere walls and sustains high-vorticity spiraling through the concentric bridge.',
      'Zero bolted flange stacks or decorative copper coils on the core Vajra assembly.',
    ],
    deviceRefs: ['432 Stubby Vajra'],
  },
  {
    id: 'exp-bubbler-ambient',
    title: 'Ambient-Water Cavitation Bubbler (Zero Pre-Heating Coils)',
    category: 'explicit',
    summary:
      'Clear cast PMMA acrylic vessel operating with ambient water as a permanent cavitation medium—strictly no heating coils or heat-exchange jackets.',
    details: [
      'UV-ionized air travels down a central 304 SS dip-tube into a submerged sparger to seed uniform micro-bubbles.',
      'Stacked 304 SS droplet-retention / coalescence baffles above the meniscus capture mist and drain liquid water back to the tank.',
      'Reciprocating engine vacuum/pressure pulses drive symmetric bubble collapse into structured micro-plasmoids.',
    ],
    deviceRefs: ['UV-Ionized Bubbler', 'Coupled System'],
  },

  // INTERPRETED
  {
    id: 'int-uv-spool',
    title: 'Top-Mounted 304 SS / PTFE UV Air-Ionization Chamber',
    category: 'interpreted',
    summary:
      'Interpreted as a top-mounted electropolished 304 stainless sanitary spool with PTFE seals rather than fragile quartz or UV-degrading plastics.',
    details: [
      'Why not acrylic or PVC? Shortwave 254 nm UV-C rapidly crazes and embrittles standard plastics.',
      'Why not quartz? Quartz cylinders are fragile under engine vibration and costly to seal against cyclic vacuum.',
      'Electropolished 304 SS is cheap, off-the-shelf (brewery tri-clamp spool), vacuum-safe, and reflects UV-C internally into incoming air right above the dip-tube.',
    ],
    deviceRefs: ['UV-Ionized Bubbler'],
  },
  {
    id: 'int-two-rod-bridge',
    title: 'Inner Pass-Through Isolation & Two-Rod Core Suspension',
    category: 'interpreted',
    summary:
      'Resolved how inner 3"–2" tangential ports cross the 4"–3" chamber without mixing, and how the hollow 2" core stays centered during assembly.',
    details: [
      'Inner port tubes weld directly to the 3" shell and pass through sealed U-notch/collar penetrations in the 4" outer shell, bracing both shells concentrically.',
      'Two opposing 3.2 mm ER308L 304 SS rods pin the hollow 2" sphere inside the 3" shell with minimal aerodynamic wake.',
    ],
    deviceRefs: ['432 Stubby Vajra'],
  },
  {
    id: 'int-pulse-coupling',
    title: 'Reciprocating Engine Pulse-Driven Cavitation & Vortex Coupling',
    category: 'interpreted',
    summary:
      'Connects alternating intake vacuum and exhaust shock pulses across the Bubbler and 432 Vajra.',
    details: [
      'Negative intake stroke pulls UV-conditioned air through the sparger while lowering pressure above the meniscus to nucleate micro-bubbles.',
      'Positive pressure rebound symmetrically collapses bubbles, sending energized plasmoid mist into the Blue (4"–3") outer Vajra vortex while exhaust pulses drive the counter-rotating Orange (3"–2") inner vortex.',
    ],
    deviceRefs: ['Coupled System', 'UV-Ionized Bubbler', '432 Stubby Vajra'],
  },

  // GARRY RYAN BUILD & MAKER WORKSHOP IDEAS
  {
    id: 'fab-garry-sequence',
    title: 'Garry Ryan Direct Build: Inside-Out TIG Assembly Sequence (432 Vajra)',
    category: 'fabrication',
    summary:
      'Boilermaker workflow demonstrated by Garry Ryan to assemble and leak-test the nested 4:3:2 spheres cleanly.',
    details: [
      'Step 1 — Inner 2" Core: Weld or source a hollow 2" 304 sphere shell (NOT solid stock).',
      'Step 2 — Two-Rod Pinning & 3" Closure: Suspend the hollow 2" core inside the 3" hemispheres using two opposing 304 SS support rods, weld the inner bridge tube + inner tangential port stubs, close the 3" equator, and leak-test.',
      'Step 3 — 4" Outer Closure: Fit the 4" hemispheres over the protruding inner ports and outer bridge sleeve, align concentrically, and TIG-weld the outer equator.',
    ],
    deviceRefs: ['432 Stubby Vajra'],
  },
  {
    id: 'fab-rosette-jig',
    title: 'Maker Workshop Idea: External Rosette-Weld Pin Jig',
    category: 'fabrication',
    summary:
      'A workshop fabrication idea eliminating blind internal TIG welds inside the 3" shell.',
    details: [
      'Drill two small opposing 3.5 mm pilot holes at the poles of the 3" shell and rest the 2" hollow ball on a temporary alignment shim.',
      'Insert two 3.2 mm ER308L TIG rods from the OUTSIDE until seated in dimples on the 2" sphere, then rosette/plug-weld flush from the exterior and blend smooth.',
      'Reduces internal torch gymnastics to zero and guarantees repeatable concentricity.',
    ],
    deviceRefs: ['432 Stubby Vajra'],
  },
  {
    id: 'fab-maker-sourcing',
    title: 'Maker Workshop Idea: Low-Cost Off-the-Shelf Sourcing Playbook',
    category: 'fabrication',
    summary:
      'Substitute expensive custom CNC parts with industrial hardware, brewery fittings, and standard stock across all assemblies.',
    details: [
      'Spheres: Industrial 16–11 ga 304 tank heads or hollow level-switch float balls instead of fragile 0.5 mm garden gazing balls.',
      'Bubbler Plates & O-Rings: Laser-cut flat 304 plates + 4× all-thread tie-rods + stacked thin retainer rings creating captive Viton O-ring pockets (zero lathe work).',
      'UV & Sparger: 2" brewery tri-clamp spool + pond UV-C bulb; sintered 316L homebrew oxygenation stone; knitted 304 mesh demister pad.',
      'Resonators: Two 4"×1.5" sanitary concentric reducers welded base-to-base (Dual-Cone); four 90° mandrel-bent 304 exhaust elbows (Toroid).',
    ],
    deviceRefs: ['All Devices'],
  },

  // EXTRAPOLATED
  {
    id: 'ext-dual-cone',
    title: 'Implosive Dual-Cone Vortex Resonator (Optional Assembly)',
    category: 'extrapolated',
    summary:
      'Synthesized extrapolation pairing twin 51.84° convergent cones at a shared tangential implosion throat.',
    details: [
      'Accelerates angular velocity via conservation of angular momentum as radius narrows toward the central throat.',
      'Can be unchecked in Assembly Layers to isolate strictly core Bendall/Ryan Thunderstorm Generator hardware.',
    ],
    deviceRefs: ['Dual-Cone Resonator'],
  },
  {
    id: 'ext-toroid',
    title: 'Toroidal Plasmoid Collector Ring (Optional Assembly)',
    category: 'extrapolated',
    summary:
      'Closed-loop toroidal waveguide designed to sustain azimuthal plasmoid circulation between inlet and extraction ports.',
    details: [
      'Built cost-effectively from four 90° mandrel-bent 304 elbows (or soldered copper elbows for cold-flow bench tests).',
      'Toggleable via the Optional Extrapolated Assemblies layer checkbox.',
    ],
    deviceRefs: ['Toroidal Collector'],
  },
];
