export type TableStructure = {
  [key: string]: {
    columns: string[];
    foreignKeys: {
      [key: string]: {
        table: string;
        column: string;
      };
    };
  };
};

export type Record = {
  [key: string]: any;
};

export type ForeignKeyData = {
  [key: string]: any[];
};