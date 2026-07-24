async function uploadToSupabase(file, category) {

    const fileName =
        Date.now() + "_" + file.name;

    const { error } =
        await supabase.storage
            .from("portfolio")
            .upload(fileName, file);

    if (error) {
        alert(error.message);
        return null;
    }

    const { data } =
        supabase.storage
            .from("portfolio")
            .getPublicUrl(fileName);

    const imageUrl =
        data.publicUrl;

    await supabase
        .from("gallery")
        .insert({
            category: category,
            image_url: imageUrl
        });

    return imageUrl;
}