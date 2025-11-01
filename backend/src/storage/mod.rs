pub mod s3_client;
pub mod image_processor;

pub use s3_client::S3Client;
pub use image_processor::{ImageProcessor, ImageVariant, OutputFormat, ProcessedImage};
