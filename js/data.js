/* =============================================================
   Upper Harbour Youth Council — site content
   -------------------------------------------------------------
   This is the ONLY file most people ever need to edit.
   Names, milestones, events, links and documents all live here.
   The page, org chart and PDF viewer are built from it.

   Photos: drop image files into assets/photos/ using the file names
   referenced below. Any photo that is missing simply shows a
   placeholder until it is added.
   ============================================================= */
window.UHYC = {

  /* ---------- Links & integrations ---------- */
  links: {
    email: "UpperHarbourYouth@gmail.com",
    socials: [
      { name: "Instagram", handle: "@upperharbouryouthcouncil", href: "https://www.instagram.com/upperharbouryouthcouncil/", icon: "instagram", avatar: "assets/social/instagram-avatar.jpg" },
      { name: "Email",     handle: "UpperHarbourYouth@gmail.com", href: "mailto:UpperHarbourYouth@gmail.com", icon: "mail" },
      // { name: "Facebook", handle: "/upperharbouryouthcouncil", href: "https://facebook.com/...", icon: "facebook" },
      // { name: "TikTok",   handle: "@upperharbouryouth",         href: "https://tiktok.com/@...",   icon: "tiktok" },
    ],
    // Google Calendar (the calendar must be set to "public" in its sharing settings)
    calendarId: "upperharbouryouth@gmail.com",
    // Contact form: paste a Formspree endpoint (https://formspree.io/f/xxxx) to make the
    // form send. Leave blank and the form opens the visitor's email app instead.
    formEndpoint: "https://formspree.io/f/mzezegqz",
    localBoard: "https://www.aucklandcouncil.govt.nz/en/about-auckland-council/how-auckland-council-works/local-boards/all-local-boards/upper-harbour-local-board/upper-harbour-plans-agreements-reports.html",
  },

  /* ---------- Who we are ---------- */
  about: {
    founded: 2007,
    suburbs: ["Whenuapai", "Hobsonville", "West Harbour", "Greenhithe", "Albany",
              "Schnapper Rock", "Rosedale", "Pinehill", "Windsor Park", "Northcross"],
    // The Local Board / Thriving Rangatahi focus areas every event is mapped to
    focusAreas: ["Health and wellbeing", "Civic participation", "Connection and belonging",
                 "Access to opportunities", "Climate and environment"],
  },

  /* ---------- Our story (timeline) ----------
     Add, remove or reorder freely. `photo` is optional. */
  history: [
    { year: "2007", title: "Founded",
      text: "The Upper Harbour Youth Council is established to give young people a formal voice in local decision-making, one of the largest youth council jurisdictions in New Zealand." },
    { year: "2016", title: "Hearing Everyday Youth",
      text: "Under the HEY! banner the council runs Youth Week workshops, a photography competition and a spoken word night for the Upper Harbour.",
      photo: "assets/photos/timeline/2016.jpg" },
    { year: "2018", title: "De-Stress",
      text: "Our De-Stress event gives students space to unwind between mocks and finals. It has returned almost every year since." },
    { year: "2019", title: "Festival for the Future",
      text: "The council heads to Festival for the Future in Wellington, bringing back ideas that shape the next few years of projects.",
      photo: "assets/photos/timeline/2019.jpg" },
    { year: "2020", title: "Youth voice in lockdown",
      text: "During COVID-19 we surveyed young people across the area and turned the results into formal submissions to the Upper Harbour Local Board, followed by a community forum in November." },
    { year: "2021", title: "Humans of the Upper Harbour",
      text: "A storytelling project sharing the faces and voices of our community, alongside our first website, a lockdown wellbeing series and promo videos in local schools.",
      photo: "assets/photos/timeline/2021.jpg" },
    { year: "2022", title: "Creative competitions",
      text: "A Creative Writing Challenge and an Illustration competition open the year, followed by a Market Day and a fun-run fundraiser.",
      photo: "assets/photos/timeline/2022.jpg" },
    { year: "2023", title: "Pizza & Politics",
      text: "Pizza & Politics gathers feedback on the draft Upper Harbour development plan, an esports competition brings schools together, and the council helps run the Future Proof Youth Summit.",
      photo: "assets/photos/timeline/2023.jpg" },
    { year: "2024", title: "The first Art Expo",
      text: "Our first Upper Harbour Art Exhibition at Mairangi Bay Art Centre, Films & Frosting, and an Overseas University Talk with alumni from Cambridge, UC Davis and UNSW. Subgroups are introduced to run a growing council.",
      photo: "assets/photos/timeline/2024.jpg" },
    { year: "2025", title: "Book Swap at Albany Market",
      text: "A community book swap at the Albany Market, a Short-Story Competition, De-Stress, a University Expo, and the Art Expo returns with over 100 submissions and its first opening ceremony.",
      photo: "assets/hero-photo.jpg" },
    { year: "2026", title: "A full calendar",
      text: "Cultural Night, an Overseas University Expo, the Art Exhibition at Sunderland Lounge, a Beach Cleanup, and our first Enviro Fair.",
      photo: "assets/photos/timeline/2026.jpg" },
  ],

  /* ---------- Events ----------
     `when` is shown as a label. Use `date` (ISO) for upcoming events so they
     can move into "recent" automatically once the date has passed. */
  events: [
    { title: "Enviro Fair", date: "2026-09-27", when: "Sunday 27 September, 2 to 5pm",
      where: "Albany Stadium, South Lounge", photo: "assets/photos/group.jpg",
      text: "Hands-on science and sustainability for local young people: live experiments, interactive demos, a science fair with prizes, and spot prizes throughout the afternoon.",
      featured: true },
    { title: "Films & Frosting", date: "2026-11-20", dateTbc: true, when: "Term 4, date to be confirmed", where: "Albany Community Hub",
      photo: "assets/photos/films-and-frosting.jpg",
      text: "A movie night with cupcake decorating and board games. A relaxed end-of-year study break for local students." },
    { title: "Beach Cleanup", date: "2026-08-22", when: "August 2026", photo: "assets/photos/beach-cleanup.jpg",
      text: "A service morning restoring one of our local beaches, open to anyone collecting volunteer hours." },
    { title: "Art Exhibition 2026", date: "2026-07-11", when: "July 2026", where: "Sunderland Lounge, Hobsonville",
      photo: "assets/photos/art-expo-2026.jpg",
      text: "Our annual exhibition of work by young artists across the Upper Harbour, with an opening ceremony, live performances and public viewing nights." },
    { title: "Overseas University Expo", date: "2026-06-19", when: "June 2026", photo: "assets/photos/uni-expo-2026.jpg",
      text: "Students who have gone on to universities overseas and in New Zealand share their journeys, with panels and Q&A for senior students." },
    { title: "Short Story Competition", date: "2026-05-04", when: "Terms 1 and 2", photo: "assets/photos/short-story.jpg",
      text: "An online writing competition for young writers, judged by the council with prizes for the best entries." },
    { title: "Cultural Night", date: "2026-05-02", when: "2 May 2026", photo: "assets/photos/cultural-night-2026.jpg",
      text: "An evening of performances, food and games from across our cultures: jazz, harp, Chinese flute, K-pop dance, jianzi, kancha and a best-dressed runway." },
  ],

  /* ---------- Local Board documents (PDF viewer) ---------- */
  documents: [
    { id: "plan-2023",
      title: "Upper Harbour Local Board Plan 2023",
      subtitle: "Three-year direction for the area",
      file: "assets/plans/upper-harbour-local-board-plan-2023.pdf",
      source: "https://www.aucklandcouncil.govt.nz/content/dam/ac/docs/about-council/local-boards/upper-harbour/upper-harbour-local-board-plan-2023.pdf" },
    { id: "agreement-2026",
      title: "Local Board Agreement 2026/2027",
      subtitle: "This year's budget and work programme",
      file: "assets/plans/upper-harbour-local-board-agreement-2026-2027.pdf",
      source: "https://www.aucklandcouncil.govt.nz/content/dam/ac/docs/about-council/local-boards/upper-harbour/upper-harbour-local-board-agreement-2026-2027.pdf" },
  ],
  // The five outcomes from the Local Board Plan 2023 ("Our plan at a glance")
  planOutcomes: [
    { name: "Our people",      text: "An inclusive, connected community where everyone has a voice in the decisions that affect them." },
    { name: "Our environment", text: "Working with volunteers and the community to protect the Upper Harbour's natural landscapes." },
    { name: "Our community",   text: "Well-maintained sports fields, parks, coastal amenities and community facilities for everyone." },
    { name: "Our places",      text: "Better planning and infrastructure so residents can easily connect across their neighbourhoods." },
    { name: "Our economy",     text: "Supporting local businesses and communities to build a thriving, resilient, sustainable economy." },
  ],

  /* ---------- Meet the team ----------
     `current` is shown by default. `previous` councils appear in the
     "Previous councils" dropdown. Each council has exec rows and either
     `groups` (subgroups with an optional lead) or a flat `members` list.
     Add `photo: "assets/photos/team/name.jpg"` to any person for a real
     photo instead of initials. */
  team: {
    board: "Upper Harbour Local Board",
    // Headshots, matched to people by first name. Add a file and a line here.
    photos: {
      aston: "assets/photos/team/aston.jpg?v=5", percy: "assets/photos/team/percy.jpg", eric: "assets/photos/team/eric.jpg",
      vivian: "assets/photos/team/vivian.jpg", vani: "assets/photos/team/vani.jpg", suah: "assets/photos/team/suah.jpg",
      celine: "assets/photos/team/celine.jpg", lynn: "assets/photos/team/lynn.jpg", raamiz: "assets/photos/team/raamiz.jpg",
      cecilia: "assets/photos/team/cecilia.jpg", joy: "assets/photos/team/joy.jpg", sienna: "assets/photos/team/sienna.jpg",
      rahaf: "assets/photos/team/rahaf.jpg", "rui-han": "assets/photos/team/rui-han.jpg", jerry: "assets/photos/team/jerry.jpg",
      jolie: "assets/photos/team/jolie.jpg", sabrina: "assets/photos/team/sabrina.jpg", ricki: "assets/photos/team/ricki.jpg",
      kevin: "assets/photos/team/kevin.jpg", leon: "assets/photos/team/leon.jpg", bella: "assets/photos/team/bella.jpg",
    },
    current: {
      year: "2026",
      execRows: [
        [ { role: "Co-Chair", name: "Aston" }, { role: "AYV Facilitator", name: "Sophia" }, { role: "Co-Chair", name: "Percy" } ],
        [ { role: "Social Lead", name: "Vani" }, { role: "Secretary", name: "Eric" }, { role: "Treasurer", name: "Vivian" } ],
      ],
      groups: [
        { name: "Subgroup 1", lead: { name: "Annie" }, members: ["Josh", "Alex", "Carmen", "Quinn"] },
        { name: "Subgroup 2", lead: { name: "Wilson" }, members: ["Christian", "Suah", "Andrew", "Nate"] },
        { name: "Subgroup 3", lead: { name: "Sam" }, members: ["Angie", "Eva"] },
        { name: "Comms",      lead: { name: "Celine" }, members: ["Lynn"] },
      ],
    },
    previous: [
      { year: "2025",
        execRows: [
          [ { role: "Co-Chair", name: "Raamiz" }, { role: "AYV Facilitator", name: "Rebecca" }, { role: "Co-Chair", name: "Cecilia" } ],
          [ { role: "Social Lead", name: "Joy" }, { role: "Secretary", name: "Percy" }, { role: "Treasurer", name: "Vivian" } ],
        ],
        groups: [
          { name: "Team 1", members: ["Lynn", "Eric", "Sienna", "Taran"] },
          { name: "Team 2", members: ["Rahaf", "Rui-han", "Jerry", "Aston", "Jolie"] },
          { name: "Team 3", members: ["Sabrina", "Suah", "Hannah"] },
          { name: "Team 4", members: ["Ricki", "Celine", "Kevin", "Leon", "Vani"] },
          { name: "Comms",  members: ["Aston", "Leon", "Bella", "Suah"] },
        ],
      },
      { year: "2024",
        execRows: [
          [ { role: "Chair", name: "Gloria" }, { role: "AYV Facilitator", name: "Rebecca" }, { role: "Chair", name: "Nicole" } ],
        ],
        members: ["Florence", "Angelina", "Zaid", "Cecilia", "Alicia", "Percy", "Vivian", "Allen", "Joy", "Rahaf", "Raamiz", "Lynn", "Lilian"],
      },
      { year: "2020",
        execRows: [
          [ { role: "Chairperson", name: "Samuel" }, { role: "Logistics Manager", name: "Lisa" }, { role: "Communications Lead", name: "Zoya" }, { role: "Senior Advisor", name: "Bismah" } ],
        ],
        groups: [
          { name: "Team 1", lead: { name: "Michelle" }, members: [] },
          { name: "Team 2", lead: { name: "Julia" }, members: [] },
        ],
      },
    ],
  },
};
