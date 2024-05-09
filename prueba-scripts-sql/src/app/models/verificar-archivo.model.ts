export interface estadoArchivos {
    archivosGuardados: Archivos[];
    archivosFaltantes: Archivos[];
}

export interface Archivos {
    archivo:     string;
    fecha_Hora:  string;
    userName:    string;
    descripcion: string;
    existe:      boolean;
}


