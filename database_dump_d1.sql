PRAGMA foreign_keys=OFF;
CREATE TABLE `users_sessions` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO users_sessions VALUES(1,1,'b556deab-99ba-42a2-b9ce-f30d63ea0d9a','2026-03-23T18:40:03.651Z','2026-03-23T20:40:03.651Z');
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`email` text NOT NULL,
	`reset_password_token` text,
	`reset_password_expiration` text,
	`salt` text,
	`hash` text,
	`login_attempts` numeric DEFAULT 0,
	`lock_until` text
);
INSERT INTO users VALUES(1,'2026-03-23T16:23:17.087Z','2026-03-23T16:23:17.086Z','monish2.basaniwal@gmail.com',NULL,NULL,'e0370e7d1e2a1747c9cc31f083ca99f4e6a67a549d3cd3d42c1df19b73e5e7e4','340a021ec6a59f070f3f90fddece89d40efef77afbe21108915399ce3de50a3c5da0f420ab32ed4a52d1b7018ef85c53ee504b93b75d7ce5f45d647f93c61ca27a3b6029cd602d4bf48c969d909192b99e98cf166e320178bf7ca0e4e9dab6dcbf50ac4034e53a6ee8c8cd7dce788e76298beba795b4e014cf3d9cb8aae9b083b5dddeb233be0ec63f8165e2fe4c80bd3a20079a207705e4be0ff8077634c090e80f30cb951131228bf997c7d42205ff70559ad7cd954047a1ff175756085ba220d543783bdde9cda83acbaca1f971ef4cf5d3d263ace6102cda558a8b2409dcf461569af074fe80269d9fc3f95896f518d6b4ebf3d1057a1edabb89b7b34d8c18a1b1e5c1b5bd72d4e7c9705f12225b25f775b6b2c2075d56f51cfa62cbde30012f5c1ea7b2d530594356d2df2e4887997394bceeaad8be0666514b2430a613e48155581befebb6bde8569e5336e38848d5adb9242681518a80907a6f9e7f2b8fcecaf1d1cf287a3e1ed202c705507869dda9099be4b772a11f8c2baf7447f73fdc5a3f99fe04e354e9bfe908abd85be589bf496a4e6011d6d04bb69ce98bcbc2b1915e8997d60d9ad6a52c7cee75653dadc4f9ff9bb3926c281a380fb3eb398da26ef40a92c694f5b84ef8669063116385df2a41e3f87acffc82d0dcb4d5cda131c44af2d11ecbd5e174f16f938c56f69484aa0f1f3de016175bd0a6dc4516',0,NULL);
INSERT INTO users VALUES(2,'2026-03-23T16:29:36.535Z','2026-03-23T16:29:36.535Z','admin@nandithacp.com',NULL,NULL,'f26f80d0b1fdd556739262cf4b1dff278e6602c9aa22fb2d1c11e087f69253b9','d079843eea6d5c38761c08715efe6b45d79719e71e1ce47eba6f484f9e18093fb9cd4d99c454c76ee75bb49a3d9ab96092303b5d3d28da313d5bdee0df5cb95e115ea85cf90a4ddd38ee9d94528ce5255994273f1c1321f50bdd85a4ca1ff0a1430b289b45376ab6782db638d638f808c44a999e9b2cef1bd1d23b7811b4627bc491959c2b115c1d45b453d37ba9d61f9b794fc5af538517fc25d3ece234fdaab6bab300990a34d1d6c93f0c34ab0a69b5b008c676b9820d7be6a4dcce0b34c75d16b6e747d039569ab0b960cfcbb39cb21db37d66dac5101453c7e01e1199b9b3ed3e0bd2bb92ec3eb1d2696c3d924cf36364dd06c2cdb468332d6d8d413f61712308f9a4e600ebb157638cf48e7f2589754979a4f94c1e8dcf147bbb74385675218fbf1b569a90c932998ad63b76966e77460088d65502ae711ed28c42078d8b2906f773aef97c725503e23456d5bd2838158e89dc9f8c014e63c1a1584154b0d131fec32dfb6ba140e6d94aa09112eebc74483e70990cbdb26326132c416a62606822d66f13abef13e72409ab85acf96d6167b75f466309ec839689d4465c1d5931b7cb9ae7c468ce1a05ff527b3a4323e674793395eae951ab6a7e20f0b21f392d71ff6e17fa9237e88865aad2765cc209769faf747cb6160cb2275799724487fe763ef360a96e5efea49c3bda7cb3087557a816c4eef004a66008a72e2a',0,NULL);
CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`url` text,
	`thumbnail_u_r_l` text,
	`filename` text,
	`mime_type` text,
	`filesize` numeric,
	`width` numeric,
	`height` numeric,
	`focal_x` numeric,
	`focal_y` numeric
);
INSERT INTO media VALUES(1,'work-1.svg','2026-03-23T16:30:20.661Z','2026-03-23T16:30:20.660Z','/api/media/file/work-1.svg',NULL,'work-1.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(2,'work-2.svg','2026-03-23T16:30:20.668Z','2026-03-23T16:30:20.667Z','/api/media/file/work-2.svg',NULL,'work-2.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(3,'work-3.svg','2026-03-23T16:30:20.672Z','2026-03-23T16:30:20.672Z','/api/media/file/work-3.svg',NULL,'work-3.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(4,'work-4.svg','2026-03-23T16:30:20.680Z','2026-03-23T16:30:20.680Z','/api/media/file/work-4.svg',NULL,'work-4.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(5,'studio-1.svg','2026-03-23T16:30:20.686Z','2026-03-23T16:30:20.686Z','/api/media/file/studio-1.svg',NULL,'studio-1.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(6,'studio-2.svg','2026-03-23T16:30:20.693Z','2026-03-23T16:30:20.693Z','/api/media/file/studio-2.svg',NULL,'studio-2.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(7,'studio-3.svg','2026-03-23T16:30:20.697Z','2026-03-23T16:30:20.697Z','/api/media/file/studio-3.svg',NULL,'studio-3.svg','image/svg+xml',277,800,600,NULL,NULL);
INSERT INTO media VALUES(8,'speak-1','2026-03-23T18:40:24.737Z','2026-03-23T18:40:24.737Z','/api/media/file/f5a3805ba53a7ab2b3c51fd06352c78fec842954.jpg',NULL,'f5a3805ba53a7ab2b3c51fd06352c78fec842954.jpg','image/jpeg',2442924,3024,4032,50,50);
INSERT INTO media VALUES(9,'speak-1','2026-03-23T18:43:51.357Z','2026-03-23T18:43:51.356Z','/api/media/file/dc256b708d9578fe4d3e2b457be35dde9028bac4.jpg',NULL,'dc256b708d9578fe4d3e2b457be35dde9028bac4.jpg','image/jpeg',2324591,3024,4032,50,50);
INSERT INTO media VALUES(10,'speak-2','2026-03-23T18:44:03.614Z','2026-03-23T18:44:03.614Z','/api/media/file/f5a3805ba53a7ab2b3c51fd06352c78fec842954-1.jpg',NULL,'f5a3805ba53a7ab2b3c51fd06352c78fec842954-1.jpg','image/jpeg',2442924,3024,4032,50,50);
CREATE TABLE `case_studies_hidden_headings` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`heading_text` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `case_studies`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `case_studies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`company` text NOT NULL,
	`category` text NOT NULL,
	`excerpt` text NOT NULL,
	`featured_image_id` integer NOT NULL,
	`published_date` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft',
	`is_featured` integer DEFAULT false,
	`section` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`featured_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
INSERT INTO case_studies VALUES(1,'Rethinking the Agentic AI Experience','rethinking-agentic-ai-experience','Rocketium','Agentic AI experinece','Designers were spending their days executing decisions they had already made.',1,'2025-09-14T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',1,'work-grid','2026-03-23T16:36:35.690Z','2026-03-23T16:30:20.702Z');
INSERT INTO case_studies VALUES(2,'Designing Intelligence into Every Circuit','designing-intelligence-into-every-circuit','Rocketium','Agentic AI experinece','Designers were spending their days executing decisions they had already made.',2,'2025-08-22T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',1,'work-grid','2026-03-23T16:36:35.701Z','2026-03-23T16:30:20.706Z');
INSERT INTO case_studies VALUES(3,'Neural Networks in Product Design','neural-networks-in-product-design','Rocketium','Agentic AI experinece','Designers were spending their days executing decisions they had already made.',3,'2025-07-15T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',0,'work-grid','2026-03-23T16:36:35.706Z','2026-03-23T16:30:20.710Z');
INSERT INTO case_studies VALUES(4,'When Engineering Meets Design Thinking','when-engineering-meets-design-thinking','Rocketium','Agentic AI experinece','Designers were spending their days executing decisions they had already made.',4,'2025-06-10T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',0,'work-grid','2026-03-23T16:36:35.713Z','2026-03-23T16:30:20.716Z');
INSERT INTO case_studies VALUES(5,'Particle Flow: A Generative Study','particle-flow-generative-study','Rocketium','Agentic AI experinece','An exploration of generative particle systems and visual flow.',5,'2025-05-01T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',0,'studio-grid','2026-03-23T16:36:35.720Z','2026-03-23T16:30:20.722Z');
INSERT INTO case_studies VALUES(6,'Data Mesh: Interconnected Visualization','data-mesh-interconnected-visualization','Rocketium','Agentic AI experinece','Visualizing interconnected data systems through design.',6,'2025-04-15T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',0,'studio-grid','2026-03-23T16:36:35.725Z','2026-03-23T16:30:20.727Z');
INSERT INTO case_studies VALUES(7,'Abstract Wave Dynamics','abstract-wave-dynamics','Rocketium','Agentic AI experinece','Exploring fluid dynamics in digital environments.',7,'2025-03-20T00:00:00.000Z','{"root":{"type":"root","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"paragraph","version":1,"direction":"ltr","format":"","indent":0,"children":[{"type":"text","version":1,"text":"This case study content was seeded automatically.","format":0,"mode":"normal","style":"","detail":0}]}]}}','published',0,'studio-grid','2026-03-23T16:36:35.730Z','2026-03-23T16:30:20.730Z');
INSERT INTO case_studies VALUES(8,'Learning at the Speed of Work: Microlearning for Designers, PMs, and Marketers','microlearning-for-designers-pms-marketers','Rocketium','Thought Leadership','Every role in a modern workplace demands continuous learning. Microlearning provides a practical way to stay sharp.',1,'2025-09-14T00:00:00.000Z','{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Every role in a modern workplace demands continuous learning. New tools, shifting market conditions, and evolving customer expectations mean that staying still is no longer an option. Yet the challenge is the same across roles: limited time and an overwhelming flood of information. Microlearning provides a practical way for professionals such as designers, product managers, and marketers to stay sharp without losing focus on their core work.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"type":"upload","version":3,"format":"","id":"69c16e6ffcfe1cd257dbb0b6","fields":null,"relationTo":"media","value":7},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Why These Roles Need Continuous Learning","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Designers: Trends in user experience, accessibility standards, and design tools change constantly.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Product Managers: They need to understand new frameworks, market shifts, and customer insights.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Marketers: Algorithms, platforms, and consumer behavior evolve faster than traditional training can keep up.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","version":1,"value":3}],"direction":"ltr","format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"How Microlearning Fits the Workflow","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Traditional training programs often require hours of uninterrupted focus. Microlearning breaks content into focused, bite-sized modules — typically 5 to 15 minutes — that professionals can complete between meetings, during commutes, or in spare moments throughout the day.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Benefits for Designers","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"For designers, microlearning enables rapid skill acquisition in emerging areas like AI-assisted design, motion design principles, and advanced prototyping techniques. Short format lessons allow designers to immediately apply what they learn to ongoing projects.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Benefits for Product Managers","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Product managers benefit from focused modules on market analysis, feature prioritization frameworks, and customer research methodologies. The short format respects their heavily scheduled days while ensuring continuous professional development.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Benefits for Marketers","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Marketers can stay current with platform algorithm changes, content strategy evolution, and new analytics tools through brief, targeted learning sessions that fit between campaign cycles.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Why Microlearning Works Better Than Long Courses","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Research shows that shorter learning sessions lead to better retention. The spacing effect — learning in small chunks over time rather than in massive blocks — significantly improves long-term recall and application of knowledge.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Courses for These Roles","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Modern platforms now offer curated learning paths specifically designed for design, product management, and marketing professionals. These paths combine video lessons, interactive exercises, and real-world case studies in digestible formats.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Real Life Scenarios","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h2"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Consider a designer who learns a new Figma plugin in a 10-minute tutorial during lunch, then uses it that afternoon to cut their prototyping time in half. Or a product manager who absorbs a new prioritization framework in a short module and applies it in their next sprint planning session. These are the real-world impacts of well-designed microlearning.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}','published',1,'work-grid','2026-03-23T16:50:41.511Z','2026-03-23T16:30:20.734Z');
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_kv` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL
);
CREATE TABLE `payload_locked_documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`global_slug` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_locked_documents_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	`media_id` integer,
	`case_studies_id` integer,
	`pages_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`case_studies_id`) REFERENCES `case_studies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `payload_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`value` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
INSERT INTO payload_preferences VALUES(1,'collection-pages','{}','2026-03-23T16:23:22.358Z','2026-03-23T16:23:22.358Z');
INSERT INTO payload_preferences VALUES(2,'collection-case-studies','{"limit":10,"editViewType":"default"}','2026-03-23T16:30:29.663Z','2026-03-23T16:23:24.431Z');
INSERT INTO payload_preferences VALUES(3,'collection-media','{"editViewType":"default"}','2026-03-23T18:40:10.943Z','2026-03-23T16:23:25.611Z');
INSERT INTO payload_preferences VALUES(4,'collection-users','{}','2026-03-23T16:23:26.545Z','2026-03-23T16:23:26.545Z');
INSERT INTO payload_preferences VALUES(5,'global-site-settings','{"editViewType":"default"}','2026-03-23T16:23:28.586Z','2026-03-23T16:23:28.587Z');
CREATE TABLE `payload_preferences_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO payload_preferences_rels VALUES(1,NULL,1,'user',1);
INSERT INTO payload_preferences_rels VALUES(4,NULL,4,'user',1);
INSERT INTO payload_preferences_rels VALUES(5,NULL,5,'user',1);
INSERT INTO payload_preferences_rels VALUES(6,NULL,2,'user',1);
INSERT INTO payload_preferences_rels VALUES(7,NULL,3,'user',1);
CREATE TABLE `payload_migrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`batch` numeric,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
INSERT INTO payload_migrations VALUES(1,'dev',-1,'2026-03-23 18:43:28','2026-03-22T16:54:29.412Z');
CREATE TABLE IF NOT EXISTS "site_settings" (
	`id` integer PRIMARY KEY NOT NULL,
	`site_title` text DEFAULT 'Nanditha C P',
	`hero_title` text DEFAULT 'The best design I have ever seen was not made by a human',
	`hero_subtitle` text DEFAULT 'Product Designer, Rocketium',
	`hero_image_id` integer,
	`work_section_title` text DEFAULT 'Designed by a human. Inspired by everything else.',
	`studio_section_title` text DEFAULT 'This is what I build when no one tells me what to build',
	`about_title` text DEFAULT 'Designer • Thinker',
	`about_description` text DEFAULT 'I design products. I think in systems.
Everything else you will have to watch.',
	`about_image_id` integer,
	`speaking_title` text DEFAULT 'Design is too important to keep to myself.',
	`speaking_images_left_slim_image_id` integer,
	`speaking_images_right_feature_image_id` integer,
	`speaking_images_right_caption` text DEFAULT '80% of what you build will never be used.
Why engineers need to understand design.',
	`footer_quote` text DEFAULT 'The best work happens when two people in the room refuse to settle.',
	`email` text DEFAULT 'contact@nandithacp.com',
	`glb_model_url` text DEFAULT '/Sprint.glb',
	`updated_at` text,
	`created_at` text,
	FOREIGN KEY (`hero_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`about_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`speaking_images_left_slim_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`speaking_images_right_feature_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
INSERT INTO site_settings VALUES(1,'Nanditha C P','The best design I have ever seen was not made by a human','Product Designer, Rocketium',NULL,'Designed by a human. Inspired by everything else.','This is what I build when no one tells me what to build','Designer • Thinker','I design products. I think in systems.' || char(10) || 'Everything else you will have to watch.',NULL,'Design is too important to keep to myself.',9,10,'80% of what you build will never be used.' || char(10) || 'Why engineers need to understand design.','The best work happens when two people in the room refuse to settle.','contact@nandithacp.com','/Sprint.glb','2026-03-23T18:44:04.587Z','2026-03-23T16:37:43.252Z');
CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);
CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);
CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);
CREATE INDEX `case_studies_hidden_headings_order_idx` ON `case_studies_hidden_headings` (`_order`);
CREATE INDEX `case_studies_hidden_headings_parent_id_idx` ON `case_studies_hidden_headings` (`_parent_id`);
CREATE UNIQUE INDEX `case_studies_slug_idx` ON `case_studies` (`slug`);
CREATE INDEX `case_studies_featured_image_idx` ON `case_studies` (`featured_image_id`);
CREATE INDEX `case_studies_updated_at_idx` ON `case_studies` (`updated_at`);
CREATE INDEX `case_studies_created_at_idx` ON `case_studies` (`created_at`);
CREATE UNIQUE INDEX `pages_slug_idx` ON `pages` (`slug`);
CREATE INDEX `pages_updated_at_idx` ON `pages` (`updated_at`);
CREATE INDEX `pages_created_at_idx` ON `pages` (`created_at`);
CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);
CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);
CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);
CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);
CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);
CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);
CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);
CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);
CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);
CREATE INDEX `payload_locked_documents_rels_case_studies_id_idx` ON `payload_locked_documents_rels` (`case_studies_id`);
CREATE INDEX `payload_locked_documents_rels_pages_id_idx` ON `payload_locked_documents_rels` (`pages_id`);
CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);
CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);
CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);
CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);
CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);
CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);
CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);
CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);
CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);
CREATE INDEX `site_settings_hero_image_idx` ON `site_settings` (`hero_image_id`);
CREATE INDEX `site_settings_about_image_idx` ON `site_settings` (`about_image_id`);
CREATE INDEX `site_settings_speaking_images_speaking_images_left_slim__idx` ON `site_settings` (`speaking_images_left_slim_image_id`);
CREATE INDEX `site_settings_speaking_images_speaking_images_right_feat_idx` ON `site_settings` (`speaking_images_right_feature_image_id`);
