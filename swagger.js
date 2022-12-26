import swaggerAutoGen from "swagger-autogen";

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutoGen(outputFile, endpointsFiles);
