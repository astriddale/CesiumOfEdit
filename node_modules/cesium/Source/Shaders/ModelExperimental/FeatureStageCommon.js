//This file is automatically rebuilt by the Cesium build process.
export default "vec2 computeSt(float featureId)\n\
{\n\
    float stepX = model_textureStep.x;\n\
    float centerX = model_textureStep.y;\n\
\n\
    #ifdef MULTILINE_BATCH_TEXTURE\n\
    float stepY = model_textureStep.z;\n\
    float centerY = model_textureStep.w;\n\
\n\
    float xId = mod(featureId, model_textureDimensions.x); \n\
    float yId = floor(featureId / model_textureDimensions.x);\n\
    \n\
    return vec2(centerX + (xId * stepX), centerY + (yId * stepY));\n\
    #else\n\
    return vec2(centerX + (featureId * stepX), 0.5);\n\
    #endif\n\
}\n\
";
