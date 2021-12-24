//This file is automatically rebuilt by the Cesium build process.
export default "void featureStage(inout Feature feature)\n\
{   \n\
    #ifdef FEATURE_ID_TEXTURE\n\
    \n\
    float featureId = floor(texture2D(FEATURE_ID_TEXTURE, FEATURE_ID_TEXCOORD).FEATURE_ID_CHANNEL * 255.0 + 0.5);\n\
    vec2 featureSt;\n\
    if (featureId < model_featuresLength)\n\
    {\n\
        featureSt = computeSt(featureId);\n\
\n\
        feature.id = int(featureId);\n\
        feature.st = featureSt;\n\
        feature.color = texture2D(model_batchTexture, featureSt);\n\
    }\n\
    // Floating point comparisons can be unreliable in GLSL, so we\n\
    // increment the feature ID to make sure it's always greater\n\
    // then the model_featuresLength - a condition we check for in the\n\
    // pick ID, to avoid sampling the pick texture if the feature ID is\n\
    // greater than the number of features.\n\
    else\n\
    {\n\
        feature.id = int(model_featuresLength) + 1;\n\
        feature.st = vec2(0.0);\n\
        feature.color = vec4(1.0);\n\
    }\n\
    #else\n\
    // For feature ID vertex attributes, the function generated in FeatureIdPipelineStage \n\
    // is used to update the Feature struct from the varyings passed in.\n\
    updateFeatureStruct(feature);\n\
    #endif\n\
}\n\
";
