import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Sweet } from '../services/api';

interface EditSweetModalProps {
  sweet: Sweet;
  onClose: () => void;
  onUpdate: (updates: Partial<Sweet>) => void;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const EditSweetModal = ({ sweet, onClose, onUpdate }: EditSweetModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    form.setFieldsValue({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
    });
    
    // Reset file list when sweet changes
    if (sweet.image_url && sweet.image_url.trim() !== '') {
      // If it's a base64 image, show it in the upload component
      // If it's a URL, show it and also set it in the URL input
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: sweet.image_url,
      }]);
    } else {
      setFileList([]);
    }
  }, [sweet, form]);

  const handleSubmit = async (values: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    setLoading(true);
    try {
      // Determine image_url value - always set it explicitly (like other fields)
      let imageUrl: string | null = null;
      
      if (fileList.length > 0) {
        const file = fileList[0];
        
        // Check if it's a new file upload (has originFileObj)
        if (file.originFileObj) {
          // New file uploaded - convert to base64
          try {
            imageUrl = await convertFileToBase64(file.originFileObj);
            // Verify base64 is valid
            if (!imageUrl || imageUrl.length < 100) {
              message.error('Failed to process image - invalid data');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('❌ Base64 conversion error:', error);
            message.error('Failed to process image');
            setLoading(false);
            return;
          }
        } else if (file.url) {
          // Existing image URL from fileList - use it (could be URL or base64)
          // If it's a URL input (uid: '-2'), use it
          // If it's the original image (uid: '-1'), check if we should keep it
          if (file.uid === '-2') {
            // User entered a URL directly
            imageUrl = file.url;
          } else if (file.uid === '-1') {
            // This is the original image - keep it as is
            imageUrl = file.url;
          } else {
            // Some other case - use the URL
            imageUrl = file.url;
          }
        }
      } else {
        // File list is empty - check if user explicitly removed it or just didn't change it
        // If there was an original image and now fileList is empty, user removed it
        if (sweet.image_url) {
          // User had an image but fileList is empty - they removed it
          imageUrl = null;
        } else {
          // No original image and fileList is empty - keep null
          imageUrl = null;
        }
      }
      
      // Always include image_url in updates (just like name, category, price, quantity)
      const updates: Partial<Sweet> & { image_url?: string | null } = {
        name: values.name,
        category: values.category,
        price: values.price,
        quantity: values.quantity,
        image_url: imageUrl, // Can be string, null, or undefined
      };
      
      onUpdate(updates);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update sweet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Sweet"
      open={true}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Update"
      cancelText="Cancel"
      width="90%"
      style={{ maxWidth: '500px' }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter sweet name!' }]}
        >
          <Input placeholder="Enter sweet name" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please enter category!' }]}
        >
          <Input placeholder="Enter category" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: 'Please enter price!' },
            { type: 'number', min: 0, message: 'Price must be positive!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter price"
            prefix="$"
            min={0}
            step={0.01}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: 'Please enter quantity!' },
            { type: 'number', min: 0, message: 'Quantity must be non-negative!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter quantity"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="Image"
        >
          <div>
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={(file) => {
                if (file.size > 5 * 1024 * 1024) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                // Properly wrap the file in UploadFile object with originFileObj
                setFileList([{
                  uid: Date.now().toString(),
                  name: file.name,
                  status: 'done',
                  originFileObj: file,
                }]);
                return false;
              }}
              onRemove={() => {
                setFileList([]);
                return true;
              }}
              accept="image/*"
              maxCount={1}
            >
              <button type="button" style={{ border: 0, background: 'none' }}>
                <UploadOutlined /> Click to upload
              </button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              Or enter image URL:
            </div>
            <Input
              placeholder="https://example.com/image.jpg"
              style={{ marginTop: 4 }}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) {
                  setFileList([{
                    uid: '-2',
                    name: 'image-url',
                    status: 'done',
                    url: url,
                  }]);
                } else if (fileList.length > 0 && fileList[0].uid === '-2') {
                  setFileList([]);
                }
              }}
              defaultValue={sweet.image_url && !sweet.image_url.startsWith('data:') ? sweet.image_url : ''}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSweetModal;
