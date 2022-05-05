CREATE TABLE transferencias (
	id SERIAL PRIMARY KEY,
	emisor INT, receptor INT, 
	monto FLOAT,
	fecha TIMESTAMP,
	FOREIGN KEY (emisor) REFERENCES
    usuarios(id), FOREIGN KEY (receptor) REFERENCES usuarios(id));