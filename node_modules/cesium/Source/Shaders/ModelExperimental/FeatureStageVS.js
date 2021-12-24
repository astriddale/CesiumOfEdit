//This file is automatically rebuilt by the Cesium build process.
export default "// This stage is only applied for Feature ID vertex attributes.\n\
// If Feature ID textures are present, those are used in the fragment shader.\n\
void featureStage(inout Feature feature)\n\
{\n\
    float featureId = FEATURE_ID_ATTRIBUTE;\n\
\n\
    if (featureId < model_featuresLength)\n\
    {\n\
        vec2 featureSt = computeSt(featureId);\n\
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
}\n\
";
