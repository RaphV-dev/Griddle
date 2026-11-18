-- Une seule image par pilote contenant toutes les écuries où il est passé.
-- Les images sont à placer dans client/public/teams/ (même principe que client/public/zoom/).

ALTER TABLE drivers
    ADD COLUMN teams_image_url VARCHAR(255) NULL AFTER zoom_image_url;

-- Exemple de remplissage (adapter aux noms de fichiers et aux ids/noms réels) :
-- UPDATE drivers SET teams_image_url = '/teams/hamilton.png' WHERE code = 'HAM';
-- UPDATE drivers SET teams_image_url = '/teams/alonso.png'   WHERE code = 'ALO';
-- UPDATE drivers SET teams_image_url = '/teams/leclerc.png'  WHERE code = 'LEC';
-- UPDATE drivers SET teams_image_url = '/teams/verstappen.png' WHERE code = 'VER';

-- Optionnel, une fois que tout fonctionne : les tables suivantes ne sont plus utilisées.
-- DROP TABLE driver_teams;
-- DROP TABLE teams;
