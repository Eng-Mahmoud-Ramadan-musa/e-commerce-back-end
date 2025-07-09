import { Inject, Injectable, NotFoundException, Post, UseInterceptors } from '@nestjs/common';
import { Types } from 'mongoose';
import { SearchDto, SendMailDto, UpdateUserDto } from './dto';
import { CategoryRepository, MailRepository, ProductRepository, TUser, UserRepository } from '../../DB';
import { decrypt, DISCOUNT_TYPE, emailEmitter, IdDto } from 'src/Common';
// import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';

@Injectable()
export class PublicService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mailRepository: MailRepository,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // @UseInterceptors(CacheInterceptor)
  async allData() {
    const allData = await this.productRepository.aggregate();
    // await this.cacheManager.set('allData', allData, 2);
    return allData
  }

  async getAllUsers() {
    // const allDataFromCache = await this.cacheManager.get('allData');
    return await this.userRepository.find({filter: {}});
  }

async getFilteredProducts(query: SearchDto) {
  const {
    search,
    category,
    price,
    discount,
    discountType,
    sort,
  } = query;

  const filter: any = {};

  // 🔍 البحث في العنوان أو الوصف
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // 📂 التصنيفات
if (category?.length) {
  filter['category'] = { $in: category };
}

  // 💰 السعر
  if (price) {
    const [min, max] = price.split('-').map(Number);
    const priceFilter: any = {};
    if (!isNaN(min)) priceFilter.$gte = min;
    if (!isNaN(max)) priceFilter.$lte = max;
    if (Object.keys(priceFilter).length) {
      filter.price = priceFilter;
    }
  }

  // 💸 الخصم حسب النوع
  if (discount !== undefined && discountType) {
    const numericDiscount = parseFloat(discount);
    if (!isNaN(numericDiscount)) {
      if (discountType === DISCOUNT_TYPE.Percentage) {
        filter['discount'] = { $gte: numericDiscount };
      } else if (discountType === DISCOUNT_TYPE.Fixed_Amount) {
        filter['discount'] = { $gte: numericDiscount };
      }
    }
  }

  // ↕️ الترتيب
  let sortOption: any = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'asc' ? 1 : -1;
  }

  // ✅ الاتصال بالدالة التي أرفقتها
  return this.productRepository.find({
    filter,
    sort: sortOption,
  });
}

  async getProfile(user: TUser) {
    return   {user: {
    ...user.toObject(),
    password: undefined,
  }};
  }

  async getSpecificProfile(idDto: IdDto) {
    const { id } = idDto;
  
    const user = await this.userRepository.findById({id});  

    if (!user) throw new NotFoundException(`User not found`);
    return {  user: {
    ...user.toObject(),
    password: undefined
  }}
  }

  async getAllProducts() {

    return await this.productRepository.find({filter: {}, populate: [
      {path: 'createdBy', select: 'userName email profilePic'}, 
      {path: 'category', select: 'name'}
    ]
    });
  }

  async getSpecificProduct(idDto: IdDto) {
    const { id } = idDto;

    const product = await this.productRepository.findById({id: id, populate: [{path: 'createdBy', select: 'userName email phone profilePic'}, 
      {path: 'category', select: 'name'}]});
    if(!product) throw new NotFoundException(`Product not found`);
    return product;
  };

  async getAllCategories() {
    return await this.categoryRepository.find({filter: {}, populate: {path: 'createdBy', select: 'userName email phone profilePic'}});
  }

  async getSpecificCategory(idDto: IdDto) {
    const { id } = idDto;

    const category = await this.productRepository.find({filter: {category: id}, populate: [{path: 'createdBy', select: 'userName email phone profilePic'},{path: 'category', select: 'name slug image'}]});
    if(!category) throw new NotFoundException(`category not found`);
    return category;
  };

  async getDiscounts() {
    return await this.productRepository.find({filter: {discount: {$gt: 0}}, populate: [
      {path: 'createdBy', select: 'userName email profilePic'}, 
      {path: 'category', select: 'name'}
    ]});
  }

async updateProfile(user: TUser, updateUserDto: UpdateUserDto) {
  const newUser = await this.userRepository.findByIdAndUpdate(user._id, {...updateUserDto, profilePic: updateUserDto.image}, {
    new: true, // يرجع النسخة المحدثة
    runValidators: true,
  });

  if (!newUser) {
    throw new NotFoundException('User not found');
  }

  return {
    user: {
      ...newUser.toObject(),
      phone: newUser.phone ? newUser.phone : user.phone ? decrypt(user.phone) : '',
      password: undefined,
    },
  };
}

  async removeProfile(user: TUser) {
    const {_id}= user;
    
    await this.userRepository.delete(_id);
    return  {message: "profile deleted successfully"};
  }

  async freezeProfile(user: TUser) {
    user.isDeleted = true; 
    await user.save();

    return {message: "profile frozen successfully"};
  }

async enableStep2fa(user: TUser) {

    user.enableStep_2fa = !user.enableStep_2fa;

    await user.save();

    const message = user.enableStep_2fa
      ? '2FA enabled successfully'
      : '2FA disabled successfully';

    return {
      message,
      user: {
        ...user.toObject(),
        phone: user.phone && decrypt(user.phone),
        password: undefined,
      }
    };
}

async sendMail(user: TUser, body: SendMailDto) {
  const receiver = await this.userRepository.findById({id: body.receiver});
  if(!receiver) throw new NotFoundException('receiver not found');

  const mail = await this.mailRepository.create({...body, sender: user._id});
  const subject = body.replyTo ? `${user.userName} commented on ${body.replyTo['message']}` : `${user.userName} sent you a mail`;
  emailEmitter.emit("sendEmail", receiver.email, subject, body.message, user.email);
  return {message: `mail sent successfully to ${receiver.email}`};
  
}

async getMails(user: TUser) {
  return await this.mailRepository.find({filter: {$or: [{receiver: user._id}, {sender: user._id}]}, populate: [{path: 'receiver', select: 'userName email profilePic'}, {path: 'sender', select: 'userName email profilePic'}] });
}

async deleteMail(user: TUser, id: string) {
  const mail = await this.mailRepository.findById({id: new Types.ObjectId(id)});
  if(!mail) throw new NotFoundException('mail not found');
  await this.mailRepository.delete(mail._id);
  return {message: `mail deleted successfully`};
}

async mailById(user: TUser, id: string) {
  const mail = await this.mailRepository.findOne({filter: {_id: new Types.ObjectId(id), $or: [{receiver: user._id}, {sender: user._id}]}, populate: [{path: 'receiver', select: 'userName email profilePic'}, {path: 'sender', select: 'userName email profilePic'}] });
  if(!mail) throw new NotFoundException('mail not found');
  const isReceiver = user._id.toString() === mail.receiver.toString();
  if (isReceiver && !mail.isRead) {
    mail.isRead = true;
    await mail.save();
  }

  return mail;
}

}
