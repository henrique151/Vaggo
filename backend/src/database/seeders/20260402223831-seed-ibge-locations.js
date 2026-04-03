const axios = require("axios");

("use strict");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete("cities", null, {});
    await queryInterface.bulkDelete("states", null, {});

    // 1. CRIAR A INSTÂNCIA CONFIGURADA
    const api = axios.create({
      baseURL: "https://servicodados.ibge.gov.br/api/v1/localidades",
      timeout: 15000,
      headers: { "Accept-Encoding": "gzip" },
    });

    console.log("Iniciando busca de dados no IBGE...");

    // 2. USAR A INSTÂNCIA 'api' (repare que o caminho agora é relativo ao baseURL)
    const { data: ufs } = await api.get("/estados?orderBy=nome");

    const statesToInsert = ufs.map((uf) => ({
      EST_STR_NOME: uf.nome,
      EST_STR_UF: uf.sigla,
    }));

    await queryInterface.bulkInsert("states", statesToInsert);

    const [insertedStates] = await queryInterface.sequelize.query(
      'SELECT "EST_INT_ID", "EST_STR_UF" FROM "states";',
    );

    const stateMap = {};
    insertedStates.forEach((s) => {
      stateMap[s.EST_STR_UF] = s.EST_INT_ID;
    });

    console.log("Buscando 5.570 cidades... Isso pode levar alguns segundos.");

    // 3. USAR A INSTÂNCIA 'api' NOVAMENTE
    const { data: allCities } = await api.get("/municipios?orderBy=nome");

    const citiesToInsert = allCities
      .map((city) => {
        const ufSigla = city.microrregiao?.mesorregiao?.UF?.sigla;
        const stateId = stateMap[ufSigla];

        if (!ufSigla || !stateId) return null;

        return {
          CID_STR_NOME: city.nome,
          EST_INT_ID: stateId,
        };
      })
      .filter((city) => city !== null);

    const chunkSize = 1000;
    for (let i = 0; i < citiesToInsert.length; i += chunkSize) {
      const chunk = citiesToInsert.slice(i, i + chunkSize);
      await queryInterface.bulkInsert("cities", chunk);
      console.log(`Inseridas ${i + chunk.length} cidades...`);
    }

    console.log("Localização populada com sucesso!");
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("cities", null, {});
    await queryInterface.bulkDelete("states", null, {});
  },
};
